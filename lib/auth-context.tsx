"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

import { auth, db } from "./firebase"

export interface UserData {
  uid: string
  name: string
  email: string
  role: "teacher" | "student"
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {

  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {

      if (!firebaseUser) {

        setUser(null)
        setUserData(null)
        setLoading(false)

        router.replace("/login")

        return
      }

      setUser(firebaseUser)

      const ref = doc(db, "users", firebaseUser.uid)

      const snap = await getDoc(ref)

      if (snap.exists()) {

        const data = snap.data() as UserData

        setUserData(data)

        if (data.role === "teacher") {
          router.replace("/admin")
        } else {
          router.replace("/student")
        }

      }

      setLoading(false)

    })

    return () => unsub()

  }, [router])

  const logout = async () => {
    await signOut(auth)
    router.replace("/login")
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )

}

export function useAuth() {

  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return ctx
}
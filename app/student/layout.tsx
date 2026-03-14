"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Loader2 } from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
}

export default function StudentLayout({ children }: LayoutProps) {

  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {

    if (loading) return

    // Not logged in
    if (!user) {
      router.replace("/login")
      return
    }

    // Not student
    if (userData?.role !== "student") {
      router.replace("/admin")
      return
    }

    // Profile not completed
    if (!userData?.profileCompleted && pathname !== "/student/profile") {
      router.replace("/student/profile")
      return
    }

    // Profile already completed but trying to open profile page again
    if (userData?.profileCompleted && pathname === "/student/profile") {
      router.replace("/student/tests")
      return
    }

  }, [user, userData, loading, router, pathname])


  if (loading || !userData) {
    return (
      <div style={{
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        height:"100vh"
      }}>
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div>

      {pathname !== "/student/profile" && <Navbar />}

      {children}

    </div>
  )
}
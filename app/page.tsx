"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"


export default function Home() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login")
      } else if (userData?.role === "teacher") {
        router.replace("/admin")
      } else if (userData?.role === "student") {
        router.replace("/student")
      }
    }
  }, [user, userData, loading, router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </main>
  )
}

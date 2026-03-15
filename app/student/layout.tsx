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

    // If user not logged in
    if (!user) {
      router.replace("/login")
      return
    }

    // If user is not a student
    if (userData?.role !== "student") {
      router.replace("/admin")
      return
    }

    // If profile not completed
    if (!userData?.profileCompleted && pathname !== "/student/profile") {
      router.replace("/student/profile")
      return
    }

    // If profile already completed but user opens profile again
    if (userData?.profileCompleted && pathname === "/student/profile") {
      router.replace("/student/tests")
      return
    }

  }, [user, userData, loading, router, pathname])



  /* LOADING SCREEN */

  if (loading || !userData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh"
        }}
      >
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
      </div>
    )
  }


  /* MAIN LAYOUT */

  return (
    <div className="min-h-screen flex flex-col">

      {/* Hide navbar on profile page */}
      {pathname !== "/student/profile" && <Navbar />}

      <main className="flex-1">
        {children}
      </main>

    </div>
  )
}
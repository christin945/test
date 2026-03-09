"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Loader2 } from "lucide-react"

import "./student-dashboard.css"

interface LayoutProps {
  children: React.ReactNode
}

export default function StudentLayout({ children }: LayoutProps) {

  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {

    if (!loading) {

      if (!user) {
        router.replace("/login")
      }

      else if (userData?.role !== "student") {
        router.replace("/admin")
      }

    }

  }, [user, userData, loading, router])

  if (loading || !userData) {
    return (
      <div className="loading-screen">
        <Loader2 className="loader" />
      </div>
    )
  }

  return (
    <div className="dashboard-container">

      <Navbar />

      <div className="dashboard-content">
        {children}
      </div>

    </div>
  )
}
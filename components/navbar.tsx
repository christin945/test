"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import {
  BookOpen,
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  ClipboardList,
  BarChart3
} from "lucide-react"

export function Navbar() {

  const { userData, logout } = useAuth()
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const dashboardLink =
    userData?.role === "teacher" ? "/admin" : "/student"

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileOpen(false)
      }
    }

    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [mobileOpen])

  return (

    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-lg shadow-sm">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

        {/* LOGO */}
        <Link href={dashboardLink} className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-md transition-transform group-hover:scale-110">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800">
            SmartCoach
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-2 md:flex">

          {userData?.role === "teacher" ? (
            <>
              <Link href="/admin">
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/admin/create-test">
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition">
                  <FileText className="h-4 w-4" />
                  Create Test
                </Button>
              </Link>
              <Link href="/admin/submissions">
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition">
                  <ClipboardList className="h-4 w-4" />
                  Submissions
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/student">
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/student/tests">
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition">
                  <FileText className="h-4 w-4" />
                  Tests
                </Button>
              </Link>
              <Link href="/student/results">
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition">
                  <BarChart3 className="h-4 w-4" />
                  Results
                </Button>
              </Link>
              {/* NEW PROFILE BUTTON FOR STUDENTS */}
              <Link href="/student/profile">
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
            </>
          )}

        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">

          {/* PROFILE MENU */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-blue-50 hover:text-blue-600 transition"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled className="text-xs text-gray-500">
                {userData?.name} ({userData?.role})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* MOBILE MENU BUTTON */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-blue-50 hover:text-blue-600 transition"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

        </div>

      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm md:hidden animate-fadeIn">
          <div
            ref={menuRef}
            className="mt-20 w-[90%] max-w-sm rounded-2xl bg-white p-5 shadow-xl animate-popup"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="hover:scale-110 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {userData?.role === "teacher" ? (
                <>
                  <Link href="/admin" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/admin/create-test" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600">
                      <FileText className="h-4 w-4" />
                      Create Test
                    </Button>
                  </Link>
                  <Link href="/admin/submissions" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600">
                      <ClipboardList className="h-4 w-4" />
                      Submissions
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/student" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/student/tests" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600">
                      <FileText className="h-4 w-4" />
                      Tests
                    </Button>
                  </Link>
                  <Link href="/student/results" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600">
                      <BarChart3 className="h-4 w-4" />
                      Results
                    </Button>
                  </Link>
                  {/* NEW PROFILE BUTTON FOR STUDENTS */}
                  <Link href="/student/profile" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600">
                      <User className="h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </header>
  )
}
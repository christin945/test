"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { User, Mail, Lock } from "lucide-react"

export default function StudentProfile() {
  const { userData, logout } = useAuth()
  const router = useRouter()

  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    class_course: ""
  })
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (userData) {
      setFormData({
        full_name: userData.name || "",
        class_course: userData.class_course || ""
      })
    }
  }, [userData])

  const handleUpdateProfile = async () => {
    if (!userData?.uid) return
    try {
      await updateDoc(doc(db, "users", userData.uid), {
        name: formData.full_name,
        class_course: formData.class_course
      })
      setMessage("Profile updated successfully")
      setEditing(false)
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error(err)
      setMessage("Failed to update profile")
    }
  }

  const handleSignOut = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5 space-y-6">

      <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes("successfully")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class / Course</label>
                <input
                  type="text"
                  value={formData.class_course}
                  onChange={(e) => setFormData({ ...formData, class_course: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userData?.email || ""}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div className="flex gap-4 mt-4">
                {!editing ? (
                  <Button
                    onClick={() => setEditing(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleUpdateProfile}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => {
                        setEditing(false)
                        setFormData({
                          full_name: userData?.name || "",
                          class_course: userData?.class_course || ""
                        })
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>

            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Profile Summary */}
        <Card className="space-y-4">
          <div className="text-center p-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-white"/>
            </div>
            <p className="text-lg font-bold">{userData?.name}</p>
            <p className="text-sm text-gray-500">{userData?.class_course || "No course selected"}</p>
          </div>

          <div className="space-y-2 px-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="w-5 h-5 text-blue-600"/>
              <div className="text-sm">
                <p className="text-gray-500">Email</p>
                <p className="font-medium break-all">{userData?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Lock className="w-5 h-5 text-blue-600"/>
              <div className="text-sm">
                <p className="text-gray-500">Role</p>
                <p className="font-medium">{userData?.role}</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSignOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Sign Out
          </Button>
        </Card>

      </div>

    </div>
  )
}
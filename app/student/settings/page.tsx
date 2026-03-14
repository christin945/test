"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { User, Mail, Phone, Lock, Pencil } from "lucide-react"

export default function StudentSettings() {

  const { userData, logout, updateProfile, updatePassword } = useAuth()
  const router = useRouter()

  const [editing, setEditing] = useState(false)

  const [formData, setFormData] = useState({
    full_name: "",
    mobile: "",
    exam: "",
    studentType: "",
    standard: "",
    parentName: "",
    parentMobile: ""
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (userData) {
      setFormData({
        full_name: userData.name || "",
        mobile: userData.mobile || "",
        exam: userData.exam || "",
        studentType: userData.studentType || "",
        standard: userData.standard || "",
        parentName: userData.parentName || "",
        parentMobile: userData.parentMobile || ""
      })
    }
  }, [userData])

  const handleUpdateProfile = async () => {

    try {

      await updateProfile(formData)

      setEditing(false)
      setMessage("Settings updated successfully")

      setTimeout(() => setMessage(""), 3000)

    } catch (err) {

      console.error(err)
      setMessage("Failed to update settings")

    }
  }

  const handleChangePassword = async () => {

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage("Passwords do not match")
      return
    }

    try {

      await updatePassword(passwordForm)

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

      setShowPasswordForm(false)

      setMessage("Password changed successfully")

      setTimeout(() => setMessage(""), 3000)

    } catch (err) {

      console.error(err)
      setMessage("Failed to change password")

    }
  }

  const handleSignOut = async () => {
    await logout()
    router.push("/login")
  }

  return (

    <div className="min-h-screen bg-gray-50 p-6 space-y-6">

      <h1 className="text-3xl font-bold text-gray-800">
        Account Settings
      </h1>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes("successfully")
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT SIDE */}

        <div className="lg:col-span-2 space-y-6">

          <Card>

            <CardHeader className="flex flex-row justify-between items-center">

              <CardTitle>Student Information</CardTitle>

              {!editing && (
                <Button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4"/>
                  Edit
                </Button>
              )}

            </CardHeader>

            <CardContent className="space-y-4">

              {/* NAME */}

              <div>
                <label className="text-sm text-gray-500">Full Name</label>

                {!editing ? (
                  <p className="text-lg font-medium">{formData.full_name || "Not provided"}</p>
                ) : (
                  <input
                    value={formData.full_name}
                    onChange={(e)=>setFormData({...formData, full_name:e.target.value})}
                    className="w-full border p-2 rounded-lg"
                  />
                )}
              </div>

              {/* MOBILE */}

              <div>
                <label className="text-sm text-gray-500">Mobile</label>

                {!editing ? (
                  <p className="text-lg font-medium">{formData.mobile || "Not provided"}</p>
                ) : (
                  <input
                    value={formData.mobile}
                    onChange={(e)=>setFormData({...formData, mobile:e.target.value})}
                    className="w-full border p-2 rounded-lg"
                  />
                )}
              </div>

              {/* EXAM */}

              <div>
                <label className="text-sm text-gray-500">Exam</label>

                {!editing ? (
                  <p className="text-lg font-medium">{formData.exam || "Not selected"}</p>
                ) : (
                  <select
                    value={formData.exam}
                    onChange={(e)=>setFormData({...formData, exam:e.target.value})}
                    className="w-full border p-2 rounded-lg"
                  >
                    <option value="">Select</option>
                    <option value="NEET">NEET</option>
                    <option value="JEE">JEE</option>
                  </select>
                )}
              </div>

              {/* STUDENT TYPE */}

              <div>
                <label className="text-sm text-gray-500">Student Type</label>

                {!editing ? (
                  <p className="text-lg font-medium">{formData.studentType || "Not selected"}</p>
                ) : (
                  <select
                    value={formData.studentType}
                    onChange={(e)=>setFormData({...formData, studentType:e.target.value})}
                    className="w-full border p-2 rounded-lg"
                  >
                    <option value="">Select</option>
                    <option value="school">School Student</option>
                    <option value="dropper">Dropper</option>
                  </select>
                )}
              </div>

              {/* STANDARD */}

              {formData.studentType === "school" && (
                <div>
                  <label className="text-sm text-gray-500">Standard</label>

                  {!editing ? (
                    <p className="text-lg font-medium">{formData.standard || "Not set"}</p>
                  ) : (
                    <input
                      value={formData.standard}
                      onChange={(e)=>setFormData({...formData, standard:e.target.value})}
                      className="w-full border p-2 rounded-lg"
                    />
                  )}
                </div>
              )}

              {/* PARENT NAME */}

              <div>
                <label className="text-sm text-gray-500">Parent Name</label>

                {!editing ? (
                  <p className="text-lg font-medium">{formData.parentName || "Not provided"}</p>
                ) : (
                  <input
                    value={formData.parentName}
                    onChange={(e)=>setFormData({...formData, parentName:e.target.value})}
                    className="w-full border p-2 rounded-lg"
                  />
                )}
              </div>

              {/* PARENT MOBILE */}

              <div>
                <label className="text-sm text-gray-500">Parent Mobile</label>

                {!editing ? (
                  <p className="text-lg font-medium">{formData.parentMobile || "Not provided"}</p>
                ) : (
                  <input
                    value={formData.parentMobile}
                    onChange={(e)=>setFormData({...formData, parentMobile:e.target.value})}
                    className="w-full border p-2 rounded-lg"
                  />
                )}
              </div>

              {editing && (
                <div className="flex gap-3 pt-4">

                  <Button
                    onClick={handleUpdateProfile}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Save Changes
                  </Button>

                  <Button
                    onClick={()=>setEditing(false)}
                    className="flex-1 border"
                  >
                    Cancel
                  </Button>

                </div>
              )}

            </CardContent>

          </Card>

          {/* PASSWORD */}

          <Card>

            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>

            <CardContent>

              {!showPasswordForm ? (

                <Button
                  onClick={()=>setShowPasswordForm(true)}
                  className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Change Password
                </Button>

              ) : (

                <div className="space-y-3">

                  <input
                    type="password"
                    placeholder="Current Password"
                    value={passwordForm.currentPassword}
                    onChange={(e)=>setPasswordForm({...passwordForm,currentPassword:e.target.value})}
                    className="w-full border p-2 rounded-lg"
                  />

                  <input
                    type="password"
                    placeholder="New Password"
                    value={passwordForm.newPassword}
                    onChange={(e)=>setPasswordForm({...passwordForm,newPassword:e.target.value})}
                    className="w-full border p-2 rounded-lg"
                  />

                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={passwordForm.confirmPassword}
                    onChange={(e)=>setPasswordForm({...passwordForm,confirmPassword:e.target.value})}
                    className="w-full border p-2 rounded-lg"
                  />

                  <div className="flex gap-3">

                    <Button
                      onClick={handleChangePassword}
                      className="flex-1 bg-green-600 text-white"
                    >
                      Update Password
                    </Button>

                    <Button
                      onClick={()=>setShowPasswordForm(false)}
                      className="flex-1 border"
                    >
                      Cancel
                    </Button>

                  </div>

                </div>

              )}

            </CardContent>

          </Card>

        </div>

        {/* RIGHT SIDE */}

        <Card className="p-6 text-center">

          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white"/>
          </div>

          <p className="text-lg font-bold">{formData.full_name}</p>
          <p className="text-gray-500">{formData.exam || "No exam selected"}</p>

          <div className="mt-4 text-sm text-gray-600 space-y-2">

            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4"/>
              {userData?.email}
            </div>

            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4"/>
              {formData.mobile || "No phone"}
            </div>

            <div className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4"/>
              {userData?.role}
            </div>

          </div>

          <Button
            onClick={handleSignOut}
            className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white"
          >
            Sign Out
          </Button>

        </Card>

      </div>

    </div>
  )
}
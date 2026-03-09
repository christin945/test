"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { auth } from "@/lib/firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { BookOpen, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()

  const provider = new GoogleAuthProvider()

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {

      const role = email === "teacher@smarttest.com" ? "teacher" : "student"

      await register(email, password, name, role)

      toast.success("Account created successfully!")

      if (role === "teacher") {
        router.push("/admin")
      } else {
        router.push("/student")
      }

    } catch (err: unknown) {

      const message = err instanceof Error ? err.message : "Registration failed"
      toast.error(message)

    } finally {

      setLoading(false)

    }
  }

  // Google signup
  const handleGoogleSignup = async () => {

    try {

      const result = await signInWithPopup(auth, provider)

      const user = result.user

      toast.success("Logged in with Google!")

      router.push("/student")

    } catch (error) {

      toast.error("Google sign-in failed")

    }

  }

  return (

    <main className="flex min-h-screen items-center justify-center bg-background px-4">

      <Card className="w-full max-w-md">

        <CardHeader className="text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <BookOpen className="h-7 w-7 text-primary-foreground" />
          </div>

          <CardTitle className="text-2xl font-bold">
            Create Account
          </CardTitle>

          <CardDescription>
            Smart Coaching Test Platform
          </CardDescription>

        </CardHeader>

        <CardContent>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <Label>Full Name</Label>
              <Input
                placeholder="John Doe"
                value={name}
                onChange={(e)=>setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">

              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

              Create Account

            </Button>

          </form>

          <div className="my-4 text-center text-sm text-muted-foreground">
            OR
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignup}
            variant="outline"
            className="w-full"
          >
            Continue with Google
          </Button>

          <p className="mt-4 text-center text-sm">

            Already have an account?{" "}

            <Link href="/login" className="text-primary hover:underline">
              Sign In
            </Link>

          </p>

        </CardContent>

      </Card>

    </main>
  )
}
"use client"

import { useState } from "react"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"

import { auth, db } from "@/lib/firebase"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function LoginPage() {

  const [loading,setLoading] = useState(false)

  async function handleLogin(){

    if(loading) return

    setLoading(true)

    try{

      const provider = new GoogleAuthProvider()

      const result = await signInWithPopup(auth,provider)

      const user = result.user

      const ref = doc(db,"users",user.uid)

      const snap = await getDoc(ref)

      // Create student if new user
      if(!snap.exists()){

        await setDoc(ref,{
          uid:user.uid,
          name:user.displayName,
          email:user.email,
          role:"student"
        })

      }

    }catch(err){

      if((err as any).code !== "auth/cancelled-popup-request"){
        console.error(err)
      }

    }

    setLoading(false)

  }

  return(

    <div className="flex min-h-screen items-center justify-center">

      <Card className="w-[350px]">

        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>

        <CardContent>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Signing in..." : "Continue with Google"}
          </Button>

        </CardContent>

      </Card>

    </div>

  )

}
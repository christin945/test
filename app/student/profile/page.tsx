"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"

export default function ProfilePage() {

  const router = useRouter()
  const { user } = useAuth()

  const [name,setName] = useState("")
  const [mobile,setMobile] = useState("")
  const [examType,setExamType] = useState("")
  const [standard,setStandard] = useState("")
  const [parentName,setParentName] = useState("")
  const [loading,setLoading] = useState(false)

  /* 🔹 Check profile when page loads */

  useEffect(()=>{

    const checkProfile = async ()=>{

      if(!user) return

      try{

        const docRef = doc(db,"users",user.uid)
        const snap = await getDoc(docRef)

        if(snap.exists() && snap.data().profileCompleted){
          router.push("/student/tests")
        }

      }catch(err){
        console.log(err)
      }

    }

    checkProfile()

  },[user,router])


  /* 🔹 Save profile */

  const handleSubmit = async (e:any)=>{
    e.preventDefault()

    if(!name || !mobile || !examType){
      alert("Please fill required fields")
      return
    }

    if(!user){
      alert("User not found")
      return
    }

    setLoading(true)

    try{

      await setDoc(doc(db,"users",user.uid),{
        uid:user.uid,
        name,
        mobile,
        examType,
        standard: examType === "school" ? standard : "",
        parentName,
        role:"student",
        profileCompleted:true
      },{merge:true})

      router.push("/student/tests")

    }catch(err){
      console.error(err)
      alert("Error saving profile")
    }

    setLoading(false)
  }

  return (

    <div style={{
      maxWidth:"420px",
      margin:"60px auto",
      padding:"30px",
      border:"1px solid #ddd",
      borderRadius:"12px",
      background:"white"
    }}>

      <h2 style={{
        marginBottom:"20px",
        fontSize:"24px",
        fontWeight:"600"
      }}>
        Complete Your Profile
      </h2>

      <form onSubmit={handleSubmit}>

        {/* Name */}

        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          style={inputStyle}
        />

        {/* Mobile */}

        <input
          type="tel"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e)=>setMobile(e.target.value)}
          style={inputStyle}
        />

        {/* Exam Type */}

        <select
          value={examType}
          onChange={(e)=>setExamType(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select Student Type</option>
          <option value="neet">NEET</option>
          <option value="jee">JEE</option>
          <option value="school">School Student</option>
        </select>

        {/* Standard */}

        {examType === "school" && (

          <select
            value={standard}
            onChange={(e)=>setStandard(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select Standard</option>
            <option>6</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
            <option>10</option>
            <option>11</option>
            <option>12</option>
          </select>

        )}

        {/* Parent Name */}

        <input
          type="text"
          placeholder="Parent Name"
          value={parentName}
          onChange={(e)=>setParentName(e.target.value)}
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>

      </form>

    </div>
  )
}

const inputStyle = {
  width:"100%",
  padding:"11px",
  marginBottom:"15px",
  borderRadius:"6px",
  border:"1px solid #ccc",
  fontSize:"14px"
}

const buttonStyle = {
  width:"100%",
  padding:"12px",
  borderRadius:"6px",
  border:"none",
  background:"#2563eb",
  color:"white",
  fontWeight:"600",
  cursor:"pointer"
}
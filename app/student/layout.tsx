"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

  const handleSubmit = async (e:any)=>{
    e.preventDefault()

    if(!name || !mobile || !examType){
      alert("Please fill required fields")
      return
    }

    setLoading(true)

    try{

      const res = await fetch("/api/student/profile",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          uid:user?.uid,
          name,
          mobile,
          examType,
          standard,
          parentName,
          profileCompleted:true
        })
      })

      if(res.ok){
        router.push("/student/tests")
      }

    }catch(err){
      console.error(err)
      alert("Error saving profile")
    }

    setLoading(false)

  }

  return (

    <div style={{
      maxWidth:"400px",
      margin:"50px auto",
      padding:"30px",
      border:"1px solid #ddd",
      borderRadius:"10px"
    }}>

      <h2 style={{marginBottom:"20px"}}>
        Complete Your Profile
      </h2>

      <form onSubmit={handleSubmit}>

        {/* Student Name */}

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

        {/* Standard (only school) */}

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
          style={buttonStyle}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>

      </form>

    </div>

  )

}

const inputStyle = {
  width:"100%",
  padding:"10px",
  marginBottom:"15px",
  borderRadius:"6px",
  border:"1px solid #ccc"
}

const buttonStyle = {
  width:"100%",
  padding:"12px",
  borderRadius:"6px",
  border:"none",
  background:"#2563eb",
  color:"white",
  fontWeight:"bold",
  cursor:"pointer"
}
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import "./student-dashboard.css"

import {
  FileText,
  CheckCircle,
  Clock,
  ArrowRight,
  Loader2
} from "lucide-react"

interface TestItem {
  id: string
  title: string
  subject: string
  duration: number
  totalMarks: number
  startTime: { seconds: number }
  endTime: { seconds: number }
}

interface SubmissionItem {
  testId: string
  mcqScore: number
  teacherMarks: number | null
}

export default function StudentDashboard() {

  const router = useRouter()
  const { userData } = useAuth()

  const [tests,setTests] = useState<TestItem[]>([])
  const [submissions,setSubmissions] = useState<SubmissionItem[]>([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{

    if(userData && userData.role === "teacher"){
      router.push("/admin")
      return
    }

    async function fetchData(){

      try{

        const testsSnap = await getDocs(collection(db,"tests"))

        const testsList = testsSnap.docs.map((doc)=>({
          id:doc.id,
          ...(doc.data() as Omit<TestItem,"id">)
        }))

        setTests(testsList)

        const subsSnap = await getDocs(
          query(
            collection(db,"submissions"),
            where("studentId","==",userData?.uid)
          )
        )

        const subsList = subsSnap.docs.map((doc)=>doc.data()) as SubmissionItem[]

        setSubmissions(subsList)

      }
      catch(err){
        console.error("Error loading dashboard:",err)
      }
      finally{
        setLoading(false)
      }

    }

    if(userData?.uid){
      fetchData()
    }

  },[userData,router])

  if(loading){
    return(
      <div className="loading-container">
        <Loader2 className="loader-icon"/>
      </div>
    )
  }

  const now = Date.now() / 1000

  const completedTestIds = new Set(
    submissions.map((s)=>s.testId)
  )

  const availableTests = tests.filter(
    (t)=>
      now >= t.startTime?.seconds &&
      now <= t.endTime?.seconds &&
      !completedTestIds.has(t.id)
  )

  const completedTests = tests.filter(
    (t)=>completedTestIds.has(t.id)
  )

  return(

    <div className="dashboard-container">

      {/* HEADER */}

      <div className="dashboard-header">

        <h1 className="dashboard-title">
          Welcome, {userData?.name}
        </h1>

        <p className="dashboard-subtitle">
          Here is your test overview.
        </p>

      </div>

      {/* STATS */}

      <div className="stats-grid">

        <Card className="stat-card">

          <CardHeader className="flex flex-row items-center justify-between pb-2">

            <CardTitle className="text-sm text-gray-500">
              Available Tests
            </CardTitle>

            <Clock className="icon-primary"/>

          </CardHeader>

          <CardContent>
            <div className="stat-number">
              {availableTests.length}
            </div>
          </CardContent>

        </Card>

        <Card className="stat-card">

          <CardHeader className="flex flex-row items-center justify-between pb-2">

            <CardTitle className="text-sm text-gray-500">
              Completed
            </CardTitle>

            <CheckCircle className="icon-accent"/>

          </CardHeader>

          <CardContent>
            <div className="stat-number">
              {completedTests.length}
            </div>
          </CardContent>

        </Card>

        <Card className="stat-card">

          <CardHeader className="flex flex-row items-center justify-between pb-2">

            <CardTitle className="text-sm text-gray-500">
              Total Tests
            </CardTitle>

            <FileText className="icon-chart"/>
            
          </CardHeader>

          <CardContent>
            <div className="stat-number">
              {tests.length}
            </div>
          </CardContent>

        </Card>

      </div>

      {/* AVAILABLE TESTS */}

      {availableTests.length > 0 && (

        <Card className="section-card">

          <CardHeader>
            <CardTitle>Available Tests</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">

            {availableTests.map((test)=>(

              <Link key={test.id} href={`/student/test/${test.id}`}>

                <div className="test-item">

                  <div>
                    <p className="font-medium">{test.title}</p>
                    <p className="text-sm text-gray-500">
                      {test.subject} · {test.duration} min · {test.totalMarks} marks
                    </p>
                  </div>

                  <Button className="take-test-btn">

                    Take Test
                    <ArrowRight className="ml-1 h-4 w-4"/>

                  </Button>

                </div>

              </Link>

            ))}

          </CardContent>

        </Card>

      )}

      {/* COMPLETED TESTS */}

      {completedTests.length > 0 && (

        <Card className="section-card">

          <CardHeader className="flex items-center justify-between">

            <CardTitle>Completed Tests</CardTitle>

            <Link href="/student/results">

              <Button variant="ghost" size="sm">
                View All Results
              </Button>

            </Link>

          </CardHeader>

          <CardContent className="flex flex-col gap-3">

            {completedTests.slice(0,5).map((test)=>{

              const sub = submissions.find(
                (s)=>s.testId === test.id
              )

              const score =
                (sub?.mcqScore || 0) +
                (sub?.teacherMarks || 0)

              return(

                <div key={test.id} className="completed-test">

                  <div>
                    <p className="font-medium">{test.title}</p>
                    <p className="text-sm text-gray-500">{test.subject}</p>
                  </div>

                  <Badge className="score-badge">
                    {score}/{test.totalMarks}
                  </Badge>

                </div>

              )

            })}

          </CardContent>

        </Card>

      )}

    </div>

  )

}
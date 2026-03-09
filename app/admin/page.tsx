"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

import { useAuth } from "@/lib/auth-context"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import {
  Users,
  FileText,
  ClipboardCheck,
  Plus,
  ArrowRight,
  Loader2
} from "lucide-react"

interface Stats {
  students: number
  tests: number
  submissions: number
}

export default function AdminDashboard() {

  const router = useRouter()
  const { userData } = useAuth()

  const [stats,setStats] = useState<Stats>({
    students:0,
    tests:0,
    submissions:0
  })

  const [recentTests,setRecentTests] = useState<
    Array<{
      id:string
      title:string
      subject:string
      createdAt:string
    }>
  >([])

  const [loading,setLoading] = useState(true)

  useEffect(()=>{

    // protect admin route
    if(userData && userData.role !== "teacher"){
      router.push("/student")
      return
    }

    async function fetchStats(){

      try{

        const studentsSnap = await getDocs(
          query(collection(db,"users"),where("role","==","student"))
        )

        const testsSnap = await getDocs(
          query(collection(db,"tests"),where("createdBy","==",userData?.uid))
        )

        const submissionsSnap = await getDocs(
          collection(db,"submissions")
        )

        setStats({
          students:studentsSnap.size,
          tests:testsSnap.size,
          submissions:submissionsSnap.size
        })

        const tests = testsSnap.docs.map((doc)=>({

          id:doc.id,
          title:doc.data().title,
          subject:doc.data().subject,
          createdAt:doc.data().createdAt || ""

        }))

        setRecentTests(tests.slice(0,5))

      }
      catch(err){
        console.error("Error fetching stats:",err)
      }
      finally{
        setLoading(false)
      }

    }

    if(userData?.uid){
      fetchStats()
    }

  },[userData,router])

  if(loading){
    return(
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>
    )
  }

  const statCards = [

    {
      label:"Total Students",
      value:stats.students,
      icon:Users,
      color:"text-primary"
    },

    {
      label:"Total Tests",
      value:stats.tests,
      icon:FileText,
      color:"text-accent"
    },

    {
      label:"Submissions",
      value:stats.submissions,
      icon:ClipboardCheck,
      color:"text-chart-3"
    }

  ]

  return(

    <div className="flex flex-col gap-8">

      {/* HEADER */}

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {userData?.name}
          </h1>

          <p className="text-muted-foreground">
            Here is an overview of your coaching platform.
          </p>

        </div>

        <Link href="/admin/create-test">

          <Button>

            <Plus className="mr-2 h-4 w-4"/>

            Create Test

          </Button>

        </Link>

      </div>

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {statCards.map((stat)=>(

          <Card key={stat.label}>

            <CardHeader className="flex flex-row items-center justify-between pb-2">

              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>

              <stat.icon className={`h-5 w-5 ${stat.color}`}/>

            </CardHeader>

            <CardContent>

              <div className="text-3xl font-bold">
                {stat.value}
              </div>

            </CardContent>

          </Card>

        ))}

      </div>

      {/* RECENT TESTS */}

      <Card>

        <CardHeader className="flex flex-row items-center justify-between">

          <CardTitle>
            Recent Tests
          </CardTitle>

          <Link href="/admin/submissions">

            <Button variant="ghost" size="sm">

              View All

              <ArrowRight className="ml-1 h-4 w-4"/>

            </Button>

          </Link>

        </CardHeader>

        <CardContent>

          {recentTests.length === 0 ? (

            <p className="py-8 text-center text-muted-foreground">

              No tests created yet. Create your first test to get started.

            </p>

          ) : (

            <div className="flex flex-col gap-3">

              {recentTests.map((test)=>(

                <Link key={test.id} href={`/admin/submissions/${test.id}`}>

                  <div className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-secondary">

                    <div>

                      <p className="font-medium">
                        {test.title}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {test.subject}
                      </p>

                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground"/>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </CardContent>

      </Card>

    </div>

  )

}
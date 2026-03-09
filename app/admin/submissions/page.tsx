"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Search, Loader2 } from "lucide-react"

interface TestItem {
  id: string
  title: string
  subject: string
  totalMarks: number
  submissionCount: number
  startTime: { seconds: number }
  endTime: { seconds: number }
}

export default function SubmissionsPage() {
  const { userData } = useAuth()
  const [tests, setTests] = useState<TestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchTests() {
      try {
        const testsSnap = await getDocs(query(collection(db, "tests"), where("createdBy", "==", userData?.uid)))
        const testList: TestItem[] = []

        for (const testDoc of testsSnap.docs) {
          const data = testDoc.data()
          const subsSnap = await getDocs(query(collection(db, "submissions"), where("testId", "==", testDoc.id)))

          testList.push({
            id: testDoc.id,
            title: data.title,
            subject: data.subject,
            totalMarks: data.totalMarks,
            submissionCount: subsSnap.size,
            startTime: data.startTime,
            endTime: data.endTime,
          })
        }

        setTests(testList)
      } catch (err) {
        console.error("Error fetching tests:", err)
      } finally {
        setLoading(false)
      }
    }
    if (userData?.uid) fetchTests()
  }, [userData?.uid])

  const filteredTests = tests.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
  )

  const isActive = (test: TestItem) => {
    const now = Date.now() / 1000
    return now >= test.startTime.seconds && now <= test.endTime.seconds
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Test Submissions</h1>
        <p className="text-muted-foreground">View and evaluate student submissions for each test.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredTests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tests found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTests.map((test) => (
            <Card key={test.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg text-foreground">{test.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{test.subject}</p>
                </div>
                <Badge variant={isActive(test) ? "default" : "secondary"}>
                  {isActive(test) ? "Active" : "Closed"}
                </Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">
                    {test.submissionCount} submission{test.submissionCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">Total: {test.totalMarks} marks</p>
                </div>
                <Link href={`/admin/submissions/${test.id}`}>
                  <Button variant="outline" size="sm">
                    View <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

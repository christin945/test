"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle, Clock, FileText, MessageSquare, Loader2 } from "lucide-react"

interface ResultItem {
  id: string
  testId: string
  testTitle: string
  testSubject: string
  totalMarks: number
  mcqScore: number
  teacherMarks: number | null
  feedback: string
  descriptionFileURL: string
  submittedAt: { seconds: number }
}

export default function StudentResultsPage() {
  const { userData } = useAuth()
  const [results, setResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchResults() {
      try {
        const subsSnap = await getDocs(
          query(collection(db, "submissions"), where("studentId", "==", userData?.uid))
        )
        const resultsList: ResultItem[] = []

        for (const subDoc of subsSnap.docs) {
          const data = subDoc.data()
          let testTitle = "Unknown Test"
          let testSubject = ""
          let totalMarks = 0

          try {
            const testDoc = await getDoc(doc(db, "tests", data.testId))
            if (testDoc.exists()) {
              const testData = testDoc.data()
              testTitle = testData.title
              testSubject = testData.subject
              totalMarks = testData.totalMarks
            }
          } catch {}

          resultsList.push({
            id: subDoc.id,
            testId: data.testId,
            testTitle,
            testSubject,
            totalMarks,
            mcqScore: data.mcqScore || 0,
            teacherMarks: data.teacherMarks ?? null,
            feedback: data.feedback || "",
            descriptionFileURL: data.descriptionFileURL || "",
            submittedAt: data.submittedAt,
          })
        }

        resultsList.sort((a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0))
        setResults(resultsList)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (userData?.uid) fetchResults()
  }, [userData?.uid])

  const filtered = results.filter(
    (r) =>
      r.testTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.testSubject.toLowerCase().includes(search.toLowerCase())
  )

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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Results</h1>
        <p className="text-muted-foreground">View your test scores and teacher feedback.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search results..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No results yet. Take a test to see your scores.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((result) => {
            const total = result.mcqScore + (result.teacherMarks || 0)
            const percentage = result.totalMarks > 0 ? Math.round((total / result.totalMarks) * 100) : 0
            const isEvaluated = result.teacherMarks !== null

            return (
              <Card key={result.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{result.testTitle}</CardTitle>
                      <p className="text-sm text-muted-foreground">{result.testSubject}</p>
                    </div>
                    <Badge variant={isEvaluated ? "default" : "secondary"}>
                      {isEvaluated ? "Evaluated" : "Pending Review"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">MCQ Score</p>
                        <p className="font-semibold text-foreground">{result.mcqScore}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                      <FileText className="h-4 w-4 text-accent" />
                      <div>
                        <p className="text-xs text-muted-foreground">Description</p>
                        <p className="font-semibold text-foreground">
                          {isEvaluated ? result.teacherMarks : "Pending"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                      <Clock className="h-4 w-4 text-chart-3" />
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-semibold text-foreground">
                          {total}/{result.totalMarks} ({percentage}%)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Progress value={percentage} className="h-2 flex-1" />
                    <span className="text-sm font-medium text-foreground">{percentage}%</span>
                  </div>

                  {result.feedback && (
                    <>
                      <Separator />
                      <div className="flex gap-2">
                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Teacher Feedback</p>
                          <p className="text-sm leading-relaxed text-foreground">{result.feedback}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {result.descriptionFileURL && (
                    <a
                      href={result.descriptionFileURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View Submitted PDF
                    </a>
                  )}

                  {result.submittedAt && (
                    <p className="text-xs text-muted-foreground">
                      Submitted on {new Date(result.submittedAt.seconds * 1000).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useState, use } from "react"
import { doc, getDoc, collection, getDocs, query, where, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Search, Download, Eye, Save, Loader2, FileText } from "lucide-react"
import { toast } from "sonner"

interface Submission {
  id: string
  studentId: string
  studentName: string
  mcqScore: number
  descriptionFileURL: string
  teacherMarks: number | null
  feedback: string
  submittedAt: { seconds: number }
}

interface TestData {
  title: string
  subject: string
  totalMarks: number
  questions: Array<{ type: string; marks: number; text: string }>
}

export default function TestSubmissionsPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = use(params)
  const [test, setTest] = useState<TestData | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [evaluating, setEvaluating] = useState<string | null>(null)
  const [marks, setMarks] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const testDoc = await getDoc(doc(db, "tests", testId))
        if (testDoc.exists()) {
          setTest(testDoc.data() as TestData)
        }

        const subsSnap = await getDocs(query(collection(db, "submissions"), where("testId", "==", testId)))
        const subs: Submission[] = []
        for (const subDoc of subsSnap.docs) {
          const data = subDoc.data()
          let studentName = "Unknown"
          try {
            const userDoc = await getDoc(doc(db, "users", data.studentId))
            if (userDoc.exists()) studentName = userDoc.data().name
          } catch {}
          subs.push({
            id: subDoc.id,
            studentId: data.studentId,
            studentName,
            mcqScore: data.mcqScore || 0,
            descriptionFileURL: data.descriptionFileURL || "",
            teacherMarks: data.teacherMarks ?? null,
            feedback: data.feedback || "",
            submittedAt: data.submittedAt,
          })
        }
        setSubmissions(subs)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [testId])

  const handleSaveEvaluation = async (submissionId: string) => {
    setSaving(true)
    try {
      await updateDoc(doc(db, "submissions", submissionId), {
        teacherMarks: marks,
        feedback,
      })
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, teacherMarks: marks, feedback } : s))
      )
      setEvaluating(null)
      toast.success("Evaluation saved!")
    } catch (err) {
      console.error(err)
      toast.error("Failed to save evaluation")
    } finally {
      setSaving(false)
    }
  }

  const filteredSubmissions = submissions.filter((s) =>
    s.studentName.toLowerCase().includes(search.toLowerCase())
  )

  const totalMCQMarks = test?.questions?.filter((q) => q.type === "mcq").reduce((acc, q) => acc + q.marks, 0) || 0
  const totalDescMarks = test?.questions?.filter((q) => q.type === "description").reduce((acc, q) => acc + q.marks, 0) || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!test) {
    return <p className="py-8 text-center text-muted-foreground">Test not found.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{test.title}</h1>
        <p className="text-muted-foreground">
          {test.subject} &middot; {test.totalMarks} marks &middot; {submissions.length} submissions
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">MCQ: {totalMCQMarks} marks</Badge>
          <Badge variant="outline">Description: {totalDescMarks} marks</Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">MCQ Score</TableHead>
                <TableHead className="text-center">Description</TableHead>
                <TableHead className="text-center">Teacher Marks</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No submissions yet.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium text-foreground">{sub.studentName}</TableCell>
                    <TableCell className="text-center">{sub.mcqScore}/{totalMCQMarks}</TableCell>
                    <TableCell className="text-center">
                      {sub.descriptionFileURL ? (
                        <a
                          href={sub.descriptionFileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" /> View PDF
                        </a>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {sub.teacherMarks !== null ? (
                        <Badge>{sub.teacherMarks}/{totalDescMarks}</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-foreground">
                      {sub.mcqScore + (sub.teacherMarks || 0)}/{test.totalMarks}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog
                        open={evaluating === sub.id}
                        onOpenChange={(open) => {
                          if (open) {
                            setEvaluating(sub.id)
                            setMarks(sub.teacherMarks || 0)
                            setFeedback(sub.feedback)
                          } else {
                            setEvaluating(null)
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 h-4 w-4" /> Evaluate
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="text-foreground">Evaluate {sub.studentName}</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col gap-4">
                            <div className="rounded-lg border border-border bg-secondary/30 p-3">
                              <p className="text-sm text-muted-foreground">Auto MCQ Score</p>
                              <p className="text-lg font-bold text-foreground">{sub.mcqScore}/{totalMCQMarks}</p>
                            </div>
                            {sub.descriptionFileURL && (
                              <div className="flex items-center gap-2">
                                <a
                                  href={sub.descriptionFileURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-primary hover:underline"
                                >
                                  <FileText className="h-4 w-4" /> Open Student PDF
                                </a>
                                <a href={sub.descriptionFileURL} download>
                                  <Button variant="ghost" size="icon">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </a>
                              </div>
                            )}
                            <Separator />
                            <div className="flex flex-col gap-2">
                              <Label>Description Marks (out of {totalDescMarks})</Label>
                              <Input
                                type="number"
                                min={0}
                                max={totalDescMarks}
                                value={marks}
                                onChange={(e) => setMarks(Number(e.target.value))}
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label>Feedback</Label>
                              <Textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Write feedback for the student..."
                                rows={4}
                              />
                            </div>
                            <Button onClick={() => handleSaveEvaluation(sub.id)} disabled={saving}>
                              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                              Save Evaluation
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

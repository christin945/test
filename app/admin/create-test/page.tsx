"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Save, Loader2, GripVertical } from "lucide-react"
import { toast } from "sonner"

interface MCQQuestion {
  type: "mcq"
  text: string
  options: [string, string, string, string]
  correctAnswer: number
  marks: number
}

interface DescriptionQuestion {
  type: "description"
  text: string
  marks: number
  instructions: string
}

type Question = MCQQuestion | DescriptionQuestion

export default function CreateTestPage() {
  const { userData } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [duration, setDuration] = useState(60)
  const [totalMarks, setTotalMarks] = useState(100)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])

  const addMCQ = () => {
    setQuestions([
      ...questions,
      {
        type: "mcq",
        text: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        marks: 1,
      },
    ])
  }

  const addDescription = () => {
    setQuestions([
      ...questions,
      {
        type: "description",
        text: "",
        marks: 5,
        instructions: "",
      },
    ])
  }

  const updateQuestion = (index: number, updated: Question) => {
    const copy = [...questions]
    copy[index] = updated
    setQuestions(copy)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (questions.length === 0) {
      toast.error("Add at least one question")
      return
    }
    if (!startDate || !endDate) {
      toast.error("Set start and end dates")
      return
    }
    setSaving(true)
    try {
      await addDoc(collection(db, "tests"), {
        title,
        subject,
        duration,
        totalMarks,
        questions,
        createdBy: userData?.uid,
        createdByName: userData?.name,
        startTime: Timestamp.fromDate(new Date(startDate)),
        endTime: Timestamp.fromDate(new Date(endDate)),
        createdAt: Timestamp.now(),
      })
      toast.success("Test created successfully!")
      router.push("/admin")
    } catch (err) {
      console.error(err)
      toast.error("Failed to create test")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Test</h1>
        <p className="text-muted-foreground">Set up a new test with MCQ and description questions.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Test Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="title">Test Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mid-Term Physics Exam" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Physics" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input id="totalMarks" type="number" min={1} value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Start Date & Time</Label>
              <Input id="startDate" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input id="endDate" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Questions ({questions.length})</CardTitle>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={addMCQ}>
                <Plus className="mr-1 h-4 w-4" /> MCQ
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={addDescription}>
                <Plus className="mr-1 h-4 w-4" /> Description
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {questions.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">
                No questions added yet. Click the buttons above to add MCQ or Description questions.
              </p>
            )}
            {questions.map((q, i) => (
              <div key={i} className="rounded-lg border border-border bg-secondary/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">
                      Q{i + 1} - {q.type === "mcq" ? "MCQ" : "Description"}
                    </span>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <Label>Question Text</Label>
                    <Textarea
                      value={q.text}
                      onChange={(e) => updateQuestion(i, { ...q, text: e.target.value })}
                      placeholder="Enter the question..."
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Marks</Label>
                    <Input
                      type="number"
                      min={1}
                      value={q.marks}
                      onChange={(e) => updateQuestion(i, { ...q, marks: Number(e.target.value) })}
                      className="w-24"
                      required
                    />
                  </div>

                  {q.type === "mcq" && (
                    <>
                      <Separator />
                      <Label>Options (select the correct answer)</Label>
                      <RadioGroup
                        value={String(q.correctAnswer)}
                        onValueChange={(v) => updateQuestion(i, { ...q, correctAnswer: Number(v) } as MCQQuestion)}
                      >
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <RadioGroupItem value={String(optIdx)} id={`q${i}-opt${optIdx}`} />
                            <Input
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...q.options] as [string, string, string, string]
                                newOpts[optIdx] = e.target.value
                                updateQuestion(i, { ...q, options: newOpts } as MCQQuestion)
                              }}
                              placeholder={`Option ${optIdx + 1}`}
                              className="flex-1"
                              required
                            />
                          </div>
                        ))}
                      </RadioGroup>
                    </>
                  )}

                  {q.type === "description" && (
                    <div className="flex flex-col gap-2">
                      <Label>Instructions for Student</Label>
                      <Textarea
                        value={q.instructions}
                        onChange={(e) => updateQuestion(i, { ...q, instructions: e.target.value } as DescriptionQuestion)}
                        placeholder="e.g. Write your answer on paper and upload a photo..."
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Test
          </Button>
        </div>
      </form>
    </div>
  )
}

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

  const [mcqCount, setMcqCount] = useState(0)
  const [descCount, setDescCount] = useState(0)

  // Generate Questions Automatically
  const generateQuestions = () => {

    if (mcqCount === 0 && descCount === 0) {
      toast.error("Enter number of questions")
      return
    }

    const newQuestions: Question[] = []

    for (let i = 0; i < mcqCount; i++) {
      newQuestions.push({
        type: "mcq",
        text: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        marks: 1,
      })
    }

    for (let i = 0; i < descCount; i++) {
      newQuestions.push({
        type: "description",
        text: "",
        marks: 5,
        instructions: "",
      })
    }

    setQuestions(newQuestions)

    toast.success("Questions generated!")
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
        <h1 className="text-3xl font-bold tracking-tight">Create Test</h1>
        <p className="text-muted-foreground">
          Create MCQ and description based tests.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* TEST DETAILS */}

        <Card>
          <CardHeader>
            <CardTitle>Test Details</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 sm:grid-cols-2">

            <div className="sm:col-span-2">
              <Label>Test Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>

            <div>
              <Label>Total Marks</Label>
              <Input
                type="number"
                min={1}
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
              />
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

          </CardContent>
        </Card>


        {/* AUTO GENERATE QUESTIONS */}

        <Card>
          <CardHeader>
            <CardTitle>Generate Questions</CardTitle>
          </CardHeader>

          <CardContent className="grid sm:grid-cols-3 gap-4">

            <div>
              <Label>MCQ Questions</Label>
              <Input
                type="number"
                min={0}
                value={mcqCount}
                onChange={(e) => setMcqCount(Number(e.target.value))}
              />
            </div>

            <div>
              <Label>Description Questions</Label>
              <Input
                type="number"
                min={0}
                value={descCount}
                onChange={(e) => setDescCount(Number(e.target.value))}
              />
            </div>

            <div className="flex items-end">
              <Button type="button" onClick={generateQuestions}>
                Generate Questions
              </Button>
            </div>

          </CardContent>
        </Card>


        {/* QUESTIONS */}

        <Card>
          <CardHeader>
            <CardTitle>
              Questions ({questions.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">

            {questions.map((q, i) => (

              <div
                key={i}
                className="border rounded-lg p-4 bg-secondary/30"
              >

                <div className="flex justify-between mb-3">

                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4" />
                    <span className="font-semibold">
                      Q{i + 1} ({q.type})
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(i)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>

                </div>

                <div className="flex flex-col gap-3">

                  <Label>Question</Label>

                  <Textarea
                    value={q.text}
                    onChange={(e) =>
                      updateQuestion(i, { ...q, text: e.target.value })
                    }
                  />

                  <Label>Marks</Label>

                  <Input
                    type="number"
                    value={q.marks}
                    onChange={(e) =>
                      updateQuestion(i, {
                        ...q,
                        marks: Number(e.target.value),
                      })
                    }
                  />

                  {q.type === "mcq" && (
                    <>
                      <Separator />

                      <RadioGroup
                        value={String(q.correctAnswer)}
                        onValueChange={(v) =>
                          updateQuestion(i, {
                            ...q,
                            correctAnswer: Number(v),
                          } as MCQQuestion)
                        }
                      >

                        {q.options.map((opt, optIdx) => (

                          <div key={optIdx} className="flex gap-2 items-center">

                            <RadioGroupItem
                              value={String(optIdx)}
                              id={`${i}-${optIdx}`}
                            />

                            <Input
                              value={opt}
                              placeholder={`Option ${optIdx + 1}`}
                              onChange={(e) => {

                                const newOpts = [...q.options] as [
                                  string,
                                  string,
                                  string,
                                  string
                                ]

                                newOpts[optIdx] = e.target.value

                                updateQuestion(i, {
                                  ...q,
                                  options: newOpts,
                                } as MCQQuestion)
                              }}
                            />

                          </div>

                        ))}
                      </RadioGroup>
                    </>
                  )}

                  {q.type === "description" && (
                    <>
                      <Label>Instructions</Label>

                      <Textarea
                        value={q.instructions}
                        onChange={(e) =>
                          updateQuestion(i, {
                            ...q,
                            instructions: e.target.value,
                          } as DescriptionQuestion)
                        }
                      />
                    </>
                  )}

                </div>

              </div>

            ))}

          </CardContent>
        </Card>


        {/* SAVE */}

        <div className="flex justify-end">

          <Button type="submit" disabled={saving} size="lg">

            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}

            Save Test

          </Button>

        </div>

      </form>

    </div>
  )
}
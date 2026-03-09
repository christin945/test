"use client"

import { useEffect, useState, useCallback, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, addDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Clock, ChevronLeft, ChevronRight, Send, Upload, Loader2, AlertTriangle, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import imageCompression from "browser-image-compression"

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

interface TestData {
  title: string
  subject: string
  duration: number
  totalMarks: number
  questions: Question[]
  startTime: { seconds: number }
  endTime: { seconds: number }
}

export default function TakeTestPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = use(params)
  const { userData } = useAuth()
  const router = useRouter()

  const [test, setTest] = useState<TestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [uploadedImages, setUploadedImages] = useState<Record<number, File>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const hasSubmittedRef = useRef(false)

  useEffect(() => {
    async function fetchTest() {
      try {
        const testDoc = await getDoc(doc(db, "tests", testId))
        if (!testDoc.exists()) {
          toast.error("Test not found")
          router.push("/student")
          return
        }
        const data = testDoc.data() as TestData
        setTest(data)
        setTimeLeft(data.duration * 60)

        const subsSnap = await getDocs(
          query(collection(db, "submissions"), where("testId", "==", testId), where("studentId", "==", userData?.uid))
        )
        if (!subsSnap.empty) {
          setAlreadySubmitted(true)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (userData?.uid) fetchTest()
  }, [testId, userData?.uid, router])

  const handleSubmit = useCallback(async () => {
    if (hasSubmittedRef.current || !test || !userData) return
    hasSubmittedRef.current = true
    setSubmitting(true)

    try {
      const mcqQuestions = test.questions.filter((q): q is MCQQuestion => q.type === "mcq")
      let mcqScore = 0
      mcqQuestions.forEach((q, idx) => {
        const qIndex = test.questions.indexOf(q)
        if (answers[qIndex] === q.correctAnswer) {
          mcqScore += q.marks
        }
      })

      let descriptionFileURL = ""
      const descImages = Object.entries(uploadedImages)
      if (descImages.length > 0) {
        const { jsPDF } = await import("jspdf")
        const pdf = new jsPDF()

        for (let i = 0; i < descImages.length; i++) {
          const [, file] = descImages[i]
          const compressed = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          })

          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(compressed)
          })

          if (i > 0) pdf.addPage()
          const imgProps = pdf.getImageProperties(dataUrl)
          const pdfWidth = pdf.internal.pageSize.getWidth() - 20
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
          pdf.addImage(dataUrl, "JPEG", 10, 10, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight() - 20))
        }

        const pdfBlob = pdf.output("blob")
        const storageRef = ref(storage, `submissions/${userData.uid}/${testId}.pdf`)
        await uploadBytes(storageRef, pdfBlob)
        descriptionFileURL = await getDownloadURL(storageRef)
      }

      const mcqAnswers: Record<string, number> = {}
      Object.entries(answers).forEach(([key, val]) => {
        mcqAnswers[key] = val
      })

      await addDoc(collection(db, "submissions"), {
        testId,
        studentId: userData.uid,
        studentName: userData.name,
        mcqAnswers,
        mcqScore,
        descriptionFileURL,
        teacherMarks: null,
        feedback: "",
        submittedAt: Timestamp.now(),
      })

      toast.success(`Test submitted! MCQ Score: ${mcqScore}`)
      router.push("/student/results")
    } catch (err) {
      console.error(err)
      toast.error("Failed to submit test")
      hasSubmittedRef.current = false
    } finally {
      setSubmitting(false)
    }
  }, [test, answers, uploadedImages, userData, testId, router])

  useEffect(() => {
    if (!test || alreadySubmitted || loading) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [test, alreadySubmitted, loading, handleSubmit])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const handleImageUpload = (qIndex: number, file: File) => {
    setUploadedImages((prev) => ({ ...prev, [qIndex]: file }))
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (alreadySubmitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-chart-3" />
        <h2 className="text-2xl font-bold text-foreground">Already Submitted</h2>
        <p className="text-muted-foreground">You have already submitted this test.</p>
        <Button onClick={() => router.push("/student/results")}>View Results</Button>
      </div>
    )
  }

  if (!test) return null

  const question = test.questions[currentQ]
  const totalQuestions = test.questions.length
  const progress = ((currentQ + 1) / totalQuestions) * 100
  const timePercent = (timeLeft / (test.duration * 60)) * 100

  return (
    <div className="flex flex-col gap-6">
      {/* Timer bar */}
      <Card className="sticky top-[4.5rem] z-40">
        <CardContent className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-foreground">{test.title}</Badge>
            <span className="text-sm text-muted-foreground">
              Q {currentQ + 1}/{totalQuestions}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={timePercent} className="hidden w-24 sm:block" />
            <div className={`flex items-center gap-1 font-mono text-sm font-bold ${timeLeft < 60 ? "text-destructive" : "text-foreground"}`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question navigation dots */}
      <div className="flex flex-wrap gap-2">
        {test.questions.map((q, idx) => {
          const isAnswered = q.type === "mcq" ? answers[idx] !== undefined : uploadedImages[idx] !== undefined
          return (
            <button
              key={idx}
              onClick={() => setCurrentQ(idx)}
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-medium transition-colors ${
                idx === currentQ
                  ? "border-primary bg-primary text-primary-foreground"
                  : isAnswered
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card text-foreground hover:bg-secondary"
              }`}
              aria-label={`Go to question ${idx + 1}`}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>

      {/* Question card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant={question.type === "mcq" ? "default" : "secondary"}>
              {question.type === "mcq" ? "MCQ" : "Description"}
            </Badge>
            <span className="text-sm text-muted-foreground">{question.marks} mark{question.marks > 1 ? "s" : ""}</span>
          </div>
          <CardTitle className="mt-2 text-xl leading-relaxed text-foreground">{question.text}</CardTitle>
        </CardHeader>
        <CardContent>
          {question.type === "mcq" ? (
            <RadioGroup
              value={answers[currentQ] !== undefined ? String(answers[currentQ]) : ""}
              onValueChange={(v) => setAnswers({ ...answers, [currentQ]: Number(v) })}
              className="flex flex-col gap-3"
            >
              {question.options.map((opt, optIdx) => (
                <Label
                  key={optIdx}
                  htmlFor={`opt-${optIdx}`}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    answers[currentQ] === optIdx ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                  }`}
                >
                  <RadioGroupItem value={String(optIdx)} id={`opt-${optIdx}`} />
                  <span className="text-foreground">{opt}</span>
                </Label>
              ))}
            </RadioGroup>
          ) : (
            <div className="flex flex-col gap-4">
              {question.instructions && (
                <div className="rounded-lg bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
                  {question.instructions}
                </div>
              )}
              <Separator />
              <p className="text-sm text-muted-foreground">
                Write your answer on paper, take a photo, and upload it below.
              </p>
              <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-border p-8">
                {uploadedImages[currentQ] ? (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-10 w-10 text-accent" />
                    <p className="text-sm font-medium text-foreground">{uploadedImages[currentQ].name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedImages[currentQ].size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <Upload className="h-10 w-10 text-muted-foreground" />
                )}
                <Label htmlFor={`upload-${currentQ}`} className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadedImages[currentQ] ? "Replace Image" : "Upload Image"}
                    </span>
                  </Button>
                </Label>
                <Input
                  id={`upload-${currentQ}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(currentQ, file)
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={currentQ === 0}
          onClick={() => setCurrentQ(currentQ - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>

        {currentQ === totalQuestions - 1 ? (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Submit Test
          </Button>
        ) : (
          <Button onClick={() => setCurrentQ(currentQ + 1)}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-2" />
    </div>
  )
}

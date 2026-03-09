"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Clock, Calendar, ArrowRight, Loader2 } from "lucide-react"

interface TestItem {
  id: string
  title: string
  subject: string
  duration: number
  totalMarks: number
  startTime: { seconds: number }
  endTime: { seconds: number }
}

export default function AvailableTestsPage() {
  const { userData } = useAuth()
  const [tests, setTests] = useState<TestItem[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        const testsSnap = await getDocs(collection(db, "tests"))
        const testsList = testsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as TestItem[]
        setTests(testsList)

        const subsSnap = await getDocs(query(collection(db, "submissions"), where("studentId", "==", userData?.uid)))
        setCompletedIds(new Set(subsSnap.docs.map((d) => d.data().testId)))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (userData?.uid) fetchData()
  }, [userData?.uid])

  const now = Date.now() / 1000
  const filtered = tests
    .filter((t) => now >= t.startTime.seconds && now <= t.endTime.seconds)
    .filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Available Tests</h1>
        <p className="text-muted-foreground">Browse and take available tests.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tests..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No active tests available right now.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((test) => {
            const completed = completedIds.has(test.id)
            return (
              <Card key={test.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{test.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{test.subject}</p>
                    </div>
                    {completed ? (
                      <Badge variant="secondary">Completed</Badge>
                    ) : (
                      <Badge>Active</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {test.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Ends {new Date(test.endTime.seconds * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  {completed ? (
                    <Link href="/student/results">
                      <Button variant="outline" size="sm">View Result</Button>
                    </Link>
                  ) : (
                    <Link href={`/student/test/${test.id}`}>
                      <Button size="sm">
                        Take Test <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
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

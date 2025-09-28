"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  BookOpen,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  ExternalLink,
  Settings,
  Send as Sync,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CanvasAssignment {
  id: string
  name: string
  description: string
  dueAt: Date
  pointsPossible: number
  submissionTypes: string[]
  courseId: string
  courseName: string
  htmlUrl: string
  submittedAt?: Date
  gradedAt?: Date
  score?: number
  workflowState: "published" | "unpublished" | "submitted" | "graded"
  lockAt?: Date
  unlockAt?: Date
}

interface CanvasCourse {
  id: string
  name: string
  courseCode: string
  term: string
  enrollmentType: "student" | "teacher" | "ta"
  totalStudents: number
  startAt: Date
  endAt: Date
}

const mockCourses: CanvasCourse[] = [
  {
    id: "1",
    name: "Calculus I",
    courseCode: "MATH 101",
    term: "Fall 2024",
    enrollmentType: "student",
    totalStudents: 45,
    startAt: new Date(2024, 8, 1),
    endAt: new Date(2024, 11, 15),
  },
  {
    id: "2",
    name: "Physics with Lab",
    courseCode: "PHYS 201",
    term: "Fall 2024",
    enrollmentType: "student",
    totalStudents: 32,
    startAt: new Date(2024, 8, 1),
    endAt: new Date(2024, 11, 15),
  },
  {
    id: "3",
    name: "General Chemistry",
    courseCode: "CHEM 101",
    term: "Fall 2024",
    enrollmentType: "student",
    totalStudents: 67,
    startAt: new Date(2024, 8, 1),
    endAt: new Date(2024, 11, 15),
  },
]

const mockAssignments: CanvasAssignment[] = [
  {
    id: "1",
    name: "Calculus Problem Set 5",
    description: "Complete problems 1-20 from Chapter 5, focusing on integration techniques and applications.",
    dueAt: new Date(2024, 11, 20, 23, 59),
    pointsPossible: 100,
    submissionTypes: ["online_upload"],
    courseId: "1",
    courseName: "MATH 101",
    htmlUrl: "https://canvas.university.edu/courses/1/assignments/1",
    workflowState: "published",
  },
  {
    id: "2",
    name: "Lab Report: Pendulum Experiment",
    description: "Write a comprehensive lab report analyzing the pendulum experiment data.",
    dueAt: new Date(2024, 11, 18, 17, 0),
    pointsPossible: 75,
    submissionTypes: ["online_upload"],
    courseId: "2",
    courseName: "PHYS 201",
    htmlUrl: "https://canvas.university.edu/courses/2/assignments/2",
    workflowState: "published",
    submittedAt: new Date(2024, 11, 16, 14, 30),
  },
  {
    id: "3",
    name: "Midterm Exam",
    description: "Comprehensive exam covering chapters 1-8.",
    dueAt: new Date(2024, 11, 22, 12, 0),
    pointsPossible: 200,
    submissionTypes: ["on_paper"],
    courseId: "3",
    courseName: "CHEM 101",
    htmlUrl: "https://canvas.university.edu/courses/3/assignments/3",
    workflowState: "published",
  },
  {
    id: "4",
    name: "Discussion Post: Chemical Bonding",
    description: "Participate in the discussion about ionic vs covalent bonding.",
    dueAt: new Date(2024, 11, 16, 23, 59),
    pointsPossible: 25,
    submissionTypes: ["discussion_topic"],
    courseId: "3",
    courseName: "CHEM 101",
    htmlUrl: "https://canvas.university.edu/courses/3/assignments/4",
    workflowState: "published",
    submittedAt: new Date(2024, 11, 15, 19, 45),
    gradedAt: new Date(2024, 11, 16, 10, 30),
    score: 23,
  },
]

export function CanvasIntegration() {
  const [assignments, setAssignments] = useState<CanvasAssignment[]>(mockAssignments)
  const [courses, setCourses] = useState<CanvasCourse[]>(mockCourses)
  const [isConnected, setIsConnected] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(new Date(2024, 11, 15, 10, 30))
  const [selectedCourses, setSelectedCourses] = useState<string[]>(["1", "2", "3"])
  const [showSettings, setShowSettings] = useState(false)

  const syncAssignments = async () => {
    setIsSyncing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLastSync(new Date())
    setIsSyncing(false)
  }

  const getAssignmentStatus = (assignment: CanvasAssignment) => {
    const now = new Date()
    const dueDate = assignment.dueAt

    if (assignment.submittedAt && assignment.gradedAt) {
      return { status: "graded", color: "bg-app-blue/20 text-app-black border-app-blue/30" }
    }
    if (assignment.submittedAt) {
      return { status: "submitted", color: "bg-app-yellow/20 text-app-black border-app-yellow/30" }
    }
    if (dueDate < now) {
      return { status: "overdue", color: "bg-app-peach/20 text-app-black border-app-peach/30" }
    }
    if (dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { status: "due soon", color: "bg-app-yellow/20 text-app-black border-app-yellow/30" }
    }
    return { status: "pending", color: "bg-app-cream/20 text-app-black border-app-cream/30" }
  }

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getSubmissionTypeIcon = (types: string[]) => {
    if (types.includes("online_upload")) return "📄"
    if (types.includes("discussion_topic")) return "💬"
    if (types.includes("on_paper")) return "📝"
    return "📋"
  }

  const filteredAssignments = assignments.filter((assignment) => selectedCourses.includes(assignment.courseId))

  const upcomingAssignments = filteredAssignments.filter((a) => !a.submittedAt && a.dueAt > new Date())
  const submittedAssignments = filteredAssignments.filter((a) => a.submittedAt)
  const overdueAssignments = filteredAssignments.filter((a) => !a.submittedAt && a.dueAt < new Date())

  return (
    <div className="space-y-6">
      {/* Canvas Connection Status */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Canvas Integration</CardTitle>
                <CardDescription>
                  {isConnected ? "Connected and syncing assignments" : "Connect to import assignments automatically"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isConnected && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-app-blue" />
                  <span>Last sync: {lastSync.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={syncAssignments}
                disabled={isSyncing}
                className="bg-primary hover:bg-primary/90"
                size="sm"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Sync className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assignment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-blue/20">
                <BookOpen className="h-5 w-5 text-app-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingAssignments.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-yellow/20">
                <CheckCircle2 className="h-5 w-5 text-app-yellow" />
              </div>
              <div>
                <p className="text-2xl font-bold">{submittedAssignments.length}</p>
                <p className="text-sm text-muted-foreground">Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-peach/20">
                <AlertCircle className="h-5 w-5 text-app-peach" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overdueAssignments.length}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-sm text-muted-foreground">Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Tabs */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Canvas Assignments</CardTitle>
          <CardDescription>Automatically imported from your Canvas courses</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Upcoming ({upcomingAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="submitted" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Submitted ({submittedAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Courses ({courses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-app-blue mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No upcoming assignments at the moment</p>
                </div>
              ) : (
                upcomingAssignments.map((assignment) => {
                  const status = getAssignmentStatus(assignment)
                  const daysUntilDue = getDaysUntilDue(assignment.dueAt)

                  return (
                    <Card key={assignment.id} className="border-border/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{getSubmissionTypeIcon(assignment.submissionTypes)}</span>
                              <h3 className="font-medium">{assignment.name}</h3>
                              <Badge className={cn("text-xs", status.color)}>{status.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{assignment.courseName}</p>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{assignment.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Due {assignment.dueAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {assignment.dueAt.toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </span>
                              </div>
                              <span
                                className={cn(
                                  daysUntilDue <= 1 ? "text-app-peach" : daysUntilDue <= 3 ? "text-app-yellow" : "",
                                )}
                              >
                                {daysUntilDue === 0
                                  ? "Due today"
                                  : daysUntilDue === 1
                                    ? "Due tomorrow"
                                    : `${daysUntilDue} days left`}
                              </span>
                              <span>{assignment.pointsPossible} points</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <a href={assignment.htmlUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Open in Canvas
                              </a>
                            </Button>
                            <Button size="sm" className="bg-primary hover:bg-primary/90">
                              <Calendar className="h-3 w-3 mr-1" />
                              Schedule Study
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </TabsContent>

            <TabsContent value="submitted" className="space-y-4">
              {submittedAssignments.map((assignment) => {
                const status = getAssignmentStatus(assignment)

                return (
                  <Card key={assignment.id} className="border-border/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getSubmissionTypeIcon(assignment.submissionTypes)}</span>
                            <h3 className="font-medium">{assignment.name}</h3>
                            <Badge className={cn("text-xs", status.color)}>{status.status}</Badge>
                            {assignment.score && (
                              <Badge variant="outline" className="text-xs">
                                {assignment.score}/{assignment.pointsPossible} pts
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{assignment.courseName}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-app-blue" />
                              <span>
                                Submitted{" "}
                                {assignment.submittedAt?.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            {assignment.gradedAt && (
                              <div className="flex items-center gap-1">
                                <span>
                                  Graded{" "}
                                  {assignment.gradedAt.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                          {assignment.score && (
                            <div className="mt-2">
                              <Progress
                                value={(assignment.score / assignment.pointsPossible) * 100}
                                className="h-2 w-32"
                              />
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={assignment.htmlUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View in Canvas
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>

            <TabsContent value="courses" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className="border-border/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{course.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{course.courseCode}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>{course.term}</span>
                            <span>{course.totalStudents} students</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {course.startAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                            {course.endAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(course.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCourses([...selectedCourses, course.id])
                              } else {
                                setSelectedCourses(selectedCourses.filter((id) => id !== course.id))
                              }
                            }}
                            className="rounded border-border"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Canvas Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Canvas Integration Settings</DialogTitle>
            <DialogDescription>Configure your Canvas connection and sync preferences</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="canvas-url">Canvas URL</Label>
              <Input id="canvas-url" placeholder="https://yourschool.instructure.com" defaultValue="" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-token">API Token</Label>
              <Input id="api-token" type="password" placeholder="Your Canvas API token" />
              <p className="text-xs text-muted-foreground">
                Generate this in Canvas Settings → Approved Integrations → New Access Token
              </p>
            </div>
            <div className="space-y-2">
              <Label>Auto-sync Frequency</Label>
              <select className="w-full p-2 border border-border rounded-md bg-background">
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every hour</option>
                <option value="240">Every 4 hours</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1 bg-primary hover:bg-primary/90">Save Settings</Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

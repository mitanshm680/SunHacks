"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Brain,
  Calendar,
  Clock,
  BookOpen,
  Zap,
  CheckCircle2,
  AlertCircle,
  Settings,
  RotateCcw,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StudySession {
  id: string
  taskId: string
  taskTitle: string
  course: string
  startTime: Date
  endTime: Date
  duration: number // in minutes
  priority: "high" | "medium" | "low"
  type: "focused" | "review" | "practice"
  confidence: number // AI confidence score 0-100
  reasoning: string
  status: "suggested" | "approved" | "scheduled"
}

interface SchedulingPreferences {
  preferredStudyHours: {
    start: number // 0-23
    end: number // 0-23
  }
  sessionDuration: {
    min: number
    max: number
    preferred: number
  }
  breakDuration: number
  studyDaysPerWeek: number
  avoidWeekends: boolean
  bufferTime: number // minutes before/after existing events
}

const mockStudySessions: StudySession[] = [
  {
    id: "1",
    taskId: "1",
    taskTitle: "Calculus Problem Set 5",
    course: "MATH 101",
    startTime: new Date(2024, 11, 16, 14, 0),
    endTime: new Date(2024, 11, 16, 16, 0),
    duration: 120,
    priority: "high",
    type: "focused",
    confidence: 92,
    reasoning: "Optimal time slot with 2-hour availability. High priority task due in 4 days.",
    status: "suggested",
  },
  {
    id: "2",
    taskId: "2",
    taskTitle: "Physics Lab Report",
    course: "PHYS 201",
    startTime: new Date(2024, 11, 17, 10, 0),
    endTime: new Date(2024, 11, 17, 11, 30),
    duration: 90,
    priority: "medium",
    type: "focused",
    confidence: 87,
    reasoning: "Morning slot for better concentration. Task already in progress.",
    status: "suggested",
  },
  {
    id: "3",
    taskId: "3",
    taskTitle: "Chemistry Review",
    course: "CHEM 101",
    startTime: new Date(2024, 11, 18, 15, 30),
    endTime: new Date(2024, 11, 18, 17, 0),
    duration: 90,
    priority: "medium",
    type: "review",
    confidence: 78,
    reasoning: "Good slot for review session. Adequate time before midterm.",
    status: "suggested",
  },
]

export function AIScheduler() {
  const [studySessions, setStudySessions] = useState<StudySession[]>(mockStudySessions)
  const [isGenerating, setIsGenerating] = useState(false)
  const [preferences, setPreferences] = useState<SchedulingPreferences>({
    preferredStudyHours: { start: 9, end: 18 },
    sessionDuration: { min: 30, max: 180, preferred: 90 },
    breakDuration: 15,
    studyDaysPerWeek: 5,
    avoidWeekends: false,
    bufferTime: 15,
  })
  const [showSettings, setShowSettings] = useState(false)

  const generateSchedule = async () => {
    setIsGenerating(true)
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real app, this would call an AI service
    const newSessions = [
      ...studySessions,
      {
        id: Date.now().toString(),
        taskId: "4",
        taskTitle: "History Essay Draft",
        course: "HIST 201",
        startTime: new Date(2024, 11, 19, 13, 0),
        endTime: new Date(2024, 11, 19, 15, 0),
        duration: 120,
        priority: "high",
        type: "focused",
        confidence: 89,
        reasoning: "Afternoon slot ideal for creative writing. Sufficient time before deadline.",
        status: "suggested",
      },
    ]

    setStudySessions(newSessions)
    setIsGenerating(false)
  }

  const approveSession = (sessionId: string) => {
    setStudySessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, status: "approved" as const } : session)),
    )
  }

  const scheduleSession = (sessionId: string) => {
    setStudySessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, status: "scheduled" as const } : session)),
    )
  }

  const removeSession = (sessionId: string) => {
    setStudySessions((prev) => prev.filter((session) => session.id !== sessionId))
  }

  const getSessionTypeColor = (type: StudySession["type"]) => {
    switch (type) {
      case "focused":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "review":
        return "bg-green-100 text-green-800 border-green-200"
      case "practice":
        return "bg-purple-100 text-purple-800 border-purple-200"
    }
  }

  const getStatusColor = (status: StudySession["status"]) => {
    switch (status) {
      case "suggested":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "scheduled":
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600"
    if (confidence >= 75) return "text-blue-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const totalStudyHours = studySessions.reduce((acc, session) => acc + session.duration / 60, 0)
  const approvedSessions = studySessions.filter((s) => s.status === "approved" || s.status === "scheduled")
  const scheduledSessions = studySessions.filter((s) => s.status === "scheduled")

  return (
    <div className="space-y-6">
      {/* AI Scheduler Header */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">AI Study Scheduler</CardTitle>
                <CardDescription>
                  Intelligent scheduling based on your calendar availability and task priorities
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={generateSchedule}
                disabled={isGenerating}
                className="bg-primary hover:bg-primary/90"
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Schedule
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Scheduling Preferences */}
      {showSettings && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Scheduling Preferences</CardTitle>
            <CardDescription>Customize how the AI creates your study schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Preferred Study Hours</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-time" className="text-xs text-muted-foreground">
                        Start Time
                      </Label>
                      <Select
                        value={preferences.preferredStudyHours.start.toString()}
                        onValueChange={(value) =>
                          setPreferences({
                            ...preferences,
                            preferredStudyHours: { ...preferences.preferredStudyHours, start: Number.parseInt(value) },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, "0")}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="end-time" className="text-xs text-muted-foreground">
                        End Time
                      </Label>
                      <Select
                        value={preferences.preferredStudyHours.end.toString()}
                        onValueChange={(value) =>
                          setPreferences({
                            ...preferences,
                            preferredStudyHours: { ...preferences.preferredStudyHours, end: Number.parseInt(value) },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, "0")}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Preferred Session Duration: {preferences.sessionDuration.preferred} minutes
                  </Label>
                  <Slider
                    value={[preferences.sessionDuration.preferred]}
                    onValueChange={([value]) =>
                      setPreferences({
                        ...preferences,
                        sessionDuration: { ...preferences.sessionDuration, preferred: value },
                      })
                    }
                    min={30}
                    max={180}
                    step={15}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>30 min</span>
                    <span>180 min</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Study Days Per Week: {preferences.studyDaysPerWeek}
                  </Label>
                  <Slider
                    value={[preferences.studyDaysPerWeek]}
                    onValueChange={([value]) => setPreferences({ ...preferences, studyDaysPerWeek: value })}
                    min={1}
                    max={7}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 day</span>
                    <span>7 days</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="avoid-weekends" className="text-sm font-medium">
                    Avoid Weekends
                  </Label>
                  <Switch
                    id="avoid-weekends"
                    checked={preferences.avoidWeekends}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, avoidWeekends: checked })}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Buffer Time: {preferences.bufferTime} minutes
                  </Label>
                  <Slider
                    value={[preferences.bufferTime]}
                    onValueChange={([value]) => setPreferences({ ...preferences, bufferTime: value })}
                    min={0}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 min</span>
                    <span>60 min</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudyHours.toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">Total Study Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Brain className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{studySessions.length}</p>
                <p className="text-sm text-muted-foreground">AI Suggestions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedSessions.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scheduledSessions.length}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Sessions */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Suggested Study Sessions</CardTitle>
          <CardDescription>AI-generated study schedule based on your availability and priorities</CardDescription>
        </CardHeader>
        <CardContent>
          {studySessions.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No study sessions yet</h3>
              <p className="text-muted-foreground mb-4">Generate your first AI-powered study schedule</p>
              <Button onClick={generateSchedule} className="bg-primary hover:bg-primary/90">
                <Zap className="h-4 w-4 mr-2" />
                Generate Schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {studySessions.map((session) => (
                <Card key={session.id} className="border-border/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium">{session.taskTitle}</h3>
                          <Badge className={cn("text-xs", getSessionTypeColor(session.type))}>{session.type}</Badge>
                          <Badge className={cn("text-xs", getStatusColor(session.status))}>
                            {session.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{session.course}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {session.startTime.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {session.startTime.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}{" "}
                              -{" "}
                              {session.endTime.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                          </div>
                          <span>({session.duration} min)</span>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium">AI Reasoning</span>
                            <Badge variant="outline" className={cn("text-xs", getConfidenceColor(session.confidence))}>
                              {session.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{session.reasoning}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {session.status === "suggested" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => approveSession(session.id)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => removeSession(session.id)}>
                              Remove
                            </Button>
                          </>
                        )}
                        {session.status === "approved" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => scheduleSession(session.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Schedule
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => removeSession(session.id)}>
                              Remove
                            </Button>
                          </>
                        )}
                        {session.status === "scheduled" && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Scheduled
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Optimal Study Times</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Morning (9-12 PM)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={85} className="w-16 h-2" />
                    <span className="text-xs text-muted-foreground">85%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Afternoon (1-5 PM)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={72} className="w-16 h-2" />
                    <span className="text-xs text-muted-foreground">72%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Evening (6-9 PM)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={45} className="w-16 h-2" />
                    <span className="text-xs text-muted-foreground">45%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Study Recommendations</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Consider shorter sessions (60-90 min) for better focus</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Your morning availability is excellent for challenging tasks</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Schedule review sessions closer to exam dates</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

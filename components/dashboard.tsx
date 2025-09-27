"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Clock, Settings, User, BookOpen, Target, Zap } from "lucide-react"
import { AssignmentsList } from "@/components/assignments-list"
import { SmartTimeline } from "@/components/smart-timeline"
import { TaskManager } from "@/components/task-manager"
import { AISchedulerEngine } from "@/components/ai-scheduler-engine"
import { SyncManager } from "@/components/sync-manager"
import { SchedulePlanner } from "@/components/schedule-planner"

interface DashboardProps {
  user: any
}

export function Dashboard({ user }: DashboardProps) {
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: "Physics Lab Report",
      course: "PHYS 201",
      dueDate: "2024-01-15",
      priority: "high" as const,
      estimatedHours: 3,
      completed: false,
    },
    {
      id: 2,
      title: "History Essay",
      course: "HIST 101",
      dueDate: "2024-01-18",
      priority: "medium" as const,
      estimatedHours: 4,
      completed: false,
    },
    {
      id: 3,
      title: "Math Problem Set",
      course: "MATH 301",
      dueDate: "2024-01-20",
      priority: "high" as const,
      estimatedHours: 2,
      completed: false,
    },
  ])

  const [personalTasks, setPersonalTasks] = useState([
    {
      id: 1,
      title: "Gym workout",
      description: "Full body workout session",
      category: "Health",
      priority: "medium" as const,
      estimatedTime: 60,
      completed: false,
      createdAt: "2024-01-10",
    },
    {
      id: 2,
      title: "Grocery shopping",
      description: "Weekly grocery run",
      category: "Personal",
      priority: "high" as const,
      dueDate: "2024-01-14",
      estimatedTime: 45,
      completed: false,
      createdAt: "2024-01-10",
    },
  ])

  const [studySessions, setStudySessions] = useState([])
  const [approvedSessions, setApprovedSessions] = useState<Set<number>>(new Set())

  const handleScheduleGenerated = (sessions: any[]) => {
    setStudySessions(sessions)
  }

  const handleSessionApproval = (sessionId: number) => {
    setApprovedSessions(new Set([...approvedSessions, sessionId]))
  }

  const handleUpdateSession = (id: number, updates: any) => {
    setStudySessions((sessions) =>
      sessions.map((session) => (session.id === id ? { ...session, ...updates } : session)),
    )
  }

  const handleDeleteSession = (id: number) => {
    setStudySessions((sessions) => sessions.filter((session) => session.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">plz use it</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
          <p className="text-muted-foreground">
            Your AI study assistant has analyzed your schedule and is ready to help you succeed.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Assignments</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.filter((a) => !a.completed).length}</div>
              <p className="text-xs text-muted-foreground">
                {assignments.filter((a) => a.priority === "high").length} high priority
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Hours Planned</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studySessions.reduce((acc, session) => acc + session.duration, 0) / 60}h
              </div>
              <p className="text-xs text-muted-foreground">{studySessions.length} sessions scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">Above average performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Suggestions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studySessions.length}</div>
              <p className="text-xs text-muted-foreground">Ready for approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="schedule">Schedule Planner</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="tasks">Personal Tasks</TabsTrigger>
            <TabsTrigger value="ai-engine">AI Engine</TabsTrigger>
            <TabsTrigger value="sync">Calendar Sync</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <SchedulePlanner
              sessions={studySessions}
              onUpdateSession={handleUpdateSession}
              onDeleteSession={handleDeleteSession}
            />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Assignments</CardTitle>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <AssignmentsList assignments={assignments.slice(0, 3)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>AI Study Plan</CardTitle>
                  </div>
                  <CardDescription>AI-generated study sessions optimized for your calendar</CardDescription>
                </CardHeader>
                <CardContent>
                  {studySessions.length > 0 ? (
                    <SmartTimeline sessions={studySessions.slice(0, 3)} />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Use the AI Engine tab to generate your personalized study schedule</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>All Assignments</CardTitle>
                <CardDescription>Automatically imported from Canvas and manually added tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <AssignmentsList assignments={assignments} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManager />
          </TabsContent>

          <TabsContent value="ai-engine">
            <AISchedulerEngine
              assignments={assignments}
              personalTasks={personalTasks}
              onScheduleGenerated={handleScheduleGenerated}
            />
          </TabsContent>

          <TabsContent value="sync">
            <SyncManager
              sessions={studySessions}
              approvedSessions={approvedSessions}
              onSyncComplete={(syncedSessions) => {
                console.log("Successfully synced sessions:", syncedSessions)
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

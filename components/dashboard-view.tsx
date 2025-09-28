"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Brain, BookOpen, Clock, Plus, Settings, Bell, CheckCircle2 } from "lucide-react"
import { CalendarView } from "@/components/calendar-view"
import { TaskList } from "@/components/task-list"
import { AIScheduler } from "@/components/ai-scheduler"
import { WelcomeTour } from "@/components/welcome-tour"
import { TaskProvider } from "@/lib/task-context"

export function DashboardView() {
  const [activeView, setActiveView] = useState("calendar")
  const [showWelcomeTour, setShowWelcomeTour] = useState(true)

  return (
    <TaskProvider>
      <div className="min-h-screen clean-bg">
      <header className="border-b border-border/30 glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Plz_Use_It</h1>
                <p className="text-xs text-muted-foreground">AI Study Planner</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-border/60 bg-primary/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                  <Calendar className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">Study Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-secondary/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10">
                  <BookOpen className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assignments</p>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-muted-foreground">Due This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-accent/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent/10">
                  <Clock className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Study Time</p>
                  <p className="text-2xl font-bold">18h</p>
                  <p className="text-xs text-muted-foreground">Planned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-app-yellow/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-yellow/20">
                  <CheckCircle2 className="h-5 w-5 text-app-black" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">75%</p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted/50 backdrop-blur-sm">
              <TabsTrigger
                value="calendar"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BookOpen className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger
                value="ai-scheduler"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Brain className="h-4 w-4" />
                AI Scheduler
              </TabsTrigger>
            </TabsList>

            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarView />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <TaskList />
          </TabsContent>

          <TabsContent value="ai-scheduler" className="space-y-6">
            <AIScheduler />
          </TabsContent>
        </Tabs>
      </div>

      {/* Welcome Tour */}
      {showWelcomeTour && <WelcomeTour onComplete={() => setShowWelcomeTour(false)} />}
      </div>
    </TaskProvider>
  )
}

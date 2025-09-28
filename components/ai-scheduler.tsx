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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Brain,
  Calendar,
  Clock,
  BookOpen,
  Zap,
  CheckCircle2,
  AlertCircle,
  Settings,
  Target,
  Scale,
  RotateCcw,
  TrendingUp,
  Plus,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTasks, Task } from "@/lib/task-context"
import { useCalendar } from "@/lib/calendar-context"
import { IntelligentScheduler, SchedulingPreferences, StudySession } from "@/lib/intelligent-scheduler"

// StudySession interface is now imported from intelligent-scheduler

// SchedulingPreferences interface is now imported from intelligent-scheduler

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

// Helper function for session status colors
const getSessionStatusColor = (status: string) => {
  switch (status) {
    case 'suggested':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function AIScheduler() {
  const { tasks, toggleTaskSelection, getSelectedTasks, getTasksForScheduling } = useTasks()
  const { events, setEvents } = useCalendar()
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Debug logging
  console.log('AIScheduler - Events:', events)
  console.log('AIScheduler - setEvents function:', typeof setEvents)
  const [showTaskSelection, setShowTaskSelection] = useState(false)
  const [showCalendarView, setShowCalendarView] = useState(false)

  // Debug logging for main component
  console.log('AIScheduler - Total tasks:', tasks.length)
  console.log('AIScheduler - Selected tasks:', getSelectedTasks().length)
  const [preferences, setPreferences] = useState<SchedulingPreferences>({
    preferredStudyHours: { start: 9, end: 18 },
    sessionDuration: { min: 30, max: 240, preferred: 90 }, // Increased max to 4 hours
    breakDuration: 15,
    studyDaysPerWeek: 5,
    avoidWeekends: false,
    bufferTime: 15,
    algorithm: 'balanced', // Default to balanced AI approach
  })
  const [showSettings, setShowSettings] = useState(false)

  const generateSchedule = async () => {
    try {
      console.log('Generate schedule button clicked!')
      setIsGenerating(true)
      
      const selectedTasks = getTasksForScheduling()
      console.log('Selected tasks for scheduling:', selectedTasks)
      
      if (selectedTasks.length === 0) {
        alert("Please select at least one task to schedule!")
        setIsGenerating(false)
        return
      }

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Use the new IntelligentScheduler
      console.log('Creating scheduler with preferences:', preferences)
      console.log('Existing events:', events)
      console.log('All tasks:', tasks)
      
      const scheduler = new IntelligentScheduler(preferences, events, tasks)
      console.log('Scheduler created successfully')
      
      const result = scheduler.generateSchedule(selectedTasks)
      console.log('Scheduler result:', result)
      console.log('Generated sessions:', result.sessions)
      console.log('Result errors:', result.errors)
      console.log('Result conflicts:', result.conflicts)
      console.log('Generated sessions count:', result.sessions.length)
      console.log('Selected tasks count:', selectedTasks.length)
      
      if (result.sessions.length === 0) {
        console.error('No sessions generated. Errors:', result.errors)
        console.error('Conflicts:', result.conflicts)
        console.error('Optimization:', result.optimization)
        console.error('Selected tasks:', selectedTasks.map(t => ({ id: t.id, title: t.title, dueDate: t.dueDate })))
        console.error('Preferences:', preferences)
        console.error('Existing events count:', events.length)
        
        // Create fallback sessions for ALL selected tasks
        const fallbackSessions: StudySession[] = selectedTasks.map((task, index) => {
          const startTime = new Date(Date.now() + (24 + index * 2) * 60 * 60 * 1000) // Spread across multiple days
          const endTime = new Date(startTime.getTime() + 90 * 60 * 1000) // 90 minutes duration
          
          return {
            id: `fallback_${Date.now()}_${index}`,
            taskId: task.id,
            title: task.title,
            taskTitle: task.title,
            startTime,
            endTime,
            duration: 90,
            type: "focused",
            confidence: 50,
            reasoning: "Fallback scheduling - scheduler failed to find optimal slots",
            priority: task.priority,
            aiOptimized: false,
            qualityScore: 50,
            urgencyScore: 50,
            course: task.course || "General",
            status: "suggested"
          }
        })
        
        console.log('Creating fallback sessions for all tasks:', fallbackSessions.length)
        setStudySessions(fallbackSessions)
        setShowCalendarView(true)
        setIsGenerating(false)
        return
      }

      // Log AI insights
      console.log(`Schedule generated with ${result.optimization}% optimization`)
      console.log('AI Insights:', result.conflicts)
      
      // Convert to the expected format
      const newSessions: StudySession[] = result.sessions.map(session => ({
        ...session,
        taskTitle: session.title,
        course: selectedTasks.find(t => t.id === session.taskId)?.course || "General",
        status: "suggested" as const,
      }))

      setStudySessions(newSessions)
      
      // Add sessions to calendar events
      const calendarEvents = newSessions.map(session => ({
        id: session.id,
        title: session.taskTitle,
        start: session.startTime,
        end: session.endTime,
        type: 'ai-suggested' as const,
        description: session.reasoning,
      }))
      
      // Merge with existing calendar events
      try {
        if (setEvents && typeof setEvents === 'function') {
          setEvents(prev => [...prev, ...calendarEvents])
          console.log('Successfully added events to calendar')
        } else {
          console.warn('setEvents function not available')
        }
      } catch (error) {
        console.error('Error adding events to calendar:', error)
      }
      
      // Show calendar view
      setShowCalendarView(true)
      setIsGenerating(false)
    } catch (error) {
      console.error('Error generating schedule:', error)
      alert('Error generating schedule. Please try again.')
      setIsGenerating(false)
    }
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
        return "bg-app-blue/20 text-app-black border-app-blue/30"
      case "review":
        return "bg-app-yellow/20 text-app-black border-app-yellow/30"
      case "practice":
        return "bg-app-peach/20 text-app-black border-app-peach/30"
    }
  }

  const getStatusColor = (status: StudySession["status"]) => {
    switch (status) {
      case "suggested":
        return "bg-app-yellow/20 text-app-black border-app-yellow/30"
      case "approved":
        return "bg-app-blue/20 text-app-black border-app-blue/30"
      case "scheduled":
        return "bg-app-peach/20 text-app-black border-app-peach/30"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-app-blue"
    if (confidence >= 75) return "text-app-yellow"
    if (confidence >= 60) return "text-app-peach"
    return "text-app-black"
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
              <Dialog open={showTaskSelection} onOpenChange={setShowTaskSelection}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Select Tasks ({getSelectedTasks().length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>Select Tasks for AI Scheduling</DialogTitle>
                    <DialogDescription>
                      Choose which tasks you want the AI to schedule study sessions for. Selected tasks will be moved to the AI Scheduler and hidden from the Tasks section.
                    </DialogDescription>
                  </DialogHeader>
                  <TaskSelectionDialog onClose={() => setShowTaskSelection(false)} />
                </DialogContent>
              </Dialog>
              
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

            {/* Algorithm Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Scheduling Algorithm</Label>
              <Select
                value={preferences.algorithm}
                onValueChange={(value: 'priority' | 'deadline' | 'energy' | 'balanced') =>
                  setPreferences({ ...preferences, algorithm: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="font-medium">Priority-Based</div>
                        <div className="text-xs text-muted-foreground">Greedy algorithm for critical tasks</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="deadline">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <div>
                        <div className="font-medium">Deadline-Driven</div>
                        <div className="text-xs text-muted-foreground">Earliest deadline first</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="energy">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <div>
                        <div className="font-medium">Energy Optimization</div>
                        <div className="text-xs text-muted-foreground">Human-centric productivity cycles</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="balanced">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-purple-500" />
                      <div>
                        <div className="font-medium">Balanced AI</div>
                        <div className="text-xs text-muted-foreground">Multi-criteria decision analysis</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose how the AI prioritizes and schedules your tasks. Each algorithm uses different strategies for optimal results.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Tasks Board */}
      {getSelectedTasks().length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Selected Tasks for AI Scheduling
            </CardTitle>
            <CardDescription>
              Tasks that will be included in the AI-generated study schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getSelectedTasks().map((task) => {
                const daysUntilDue = Math.ceil((task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={task.id} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{task.title}</h4>
                        {task.course && (
                          <p className="text-xs text-gray-600">{task.course}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleTaskSelection(task.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      >
                        ×
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className={cn(
                        daysUntilDue < 0 ? "text-red-600" : 
                        daysUntilDue <= 1 ? "text-orange-600" : 
                        "text-gray-600"
                      )}>
                        {daysUntilDue < 0 
                          ? `${Math.abs(daysUntilDue)} days overdue`
                          : daysUntilDue === 0 
                            ? "Due today"
                            : `${daysUntilDue} days left`
                        }
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-blue/20">
                <Clock className="h-5 w-5 text-app-blue" />
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-yellow/20">
                <Brain className="h-5 w-5 text-app-yellow" />
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-blue/20">
                <CheckCircle2 className="h-5 w-5 text-app-blue" />
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-peach/20">
                <Calendar className="h-5 w-5 text-app-peach" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scheduledSessions.length}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      {showCalendarView && studySessions.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Generated Schedule</CardTitle>
                <CardDescription>Review and approve your AI-generated study schedule</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCalendarView(false)}
                >
                  Hide Calendar
                </Button>
                <Button 
                  size="sm"
                  onClick={() => {
                    // Approve all sessions
                    setStudySessions(prev => 
                      prev.map(session => ({ ...session, status: "approved" as const }))
                    )
                    // Clear selected tasks from scheduling
                    const selectedTasks = getSelectedTasks()
                    selectedTasks.forEach(task => {
                      toggleTaskSelection(task.id)
                    })
                    setShowCalendarView(false)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-200 rounded"></div>
                  <span>Existing Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                  <span>AI Suggested</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-200 rounded"></div>
                  <span>Approved</span>
                </div>
              </div>
            </div>
            
            {/* Mini Calendar View */}
            <div className="border rounded-lg p-4 bg-white">
              <div className="text-sm text-gray-600 mb-3">
                {studySessions.length} study session{studySessions.length !== 1 ? 's' : ''} generated
              </div>
              <div className="space-y-2">
                {studySessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{session.taskTitle}</div>
                      <div className="text-sm text-gray-600">
                        {session.startTime.toLocaleDateString()} • {session.startTime.toLocaleTimeString()} - {session.endTime.toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{session.reasoning}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getSessionStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => approveSession(session.id)}
                          disabled={session.status === "approved" || session.status === "scheduled"}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeSession(session.id)}
                        >
                          <AlertCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                              className="bg-app-peach hover:bg-app-peach/90 text-app-black"
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
                          <Badge className="bg-app-peach/20 text-app-black border-app-peach/30">
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
                  <AlertCircle className="h-4 w-4 text-app-yellow mt-0.5 flex-shrink-0" />
                  <span>Consider shorter sessions (60-90 min) for better focus</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-app-blue mt-0.5 flex-shrink-0" />
                  <span>Your morning availability is excellent for challenging tasks</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-app-peach mt-0.5 flex-shrink-0" />
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

// Task Selection Dialog Component
function TaskSelectionDialog({ onClose }: { onClose: () => void }) {
  const { tasks, toggleTaskSelection, getSelectedTasks } = useTasks()
  const [filter, setFilter] = useState<"all" | "todo" | "in-progress">("all")
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all")

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredTasks = tasks.filter(task => {
    if (filter !== "all" && task.status !== filter) return false
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false
    if (task.status === "completed") return false
    
    // Don't show overdue tasks
    const daysUntilDue = getDaysUntilDue(task.dueDate)
    if (daysUntilDue < 0) return false
    
    return true
  })

  const selectedTasks = getSelectedTasks()

  // Debug logging
  console.log('TaskSelectionDialog - Total tasks:', tasks.length)
  console.log('TaskSelectionDialog - Filtered tasks:', filteredTasks.length)
  console.log('TaskSelectionDialog - Selected tasks:', selectedTasks.length)

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getTypeIcon = (type: Task["type"]) => {
    switch (type) {
      case "assignment":
        return <BookOpen className="h-4 w-4" />
      case "study":
        return <Brain className="h-4 w-4" />
      case "personal":
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Selected Tasks Summary */}
      {selectedTasks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="text-sm text-blue-700">
            {selectedTasks.map(task => task.title).join(", ")}
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTasks.map((task) => {
          const daysUntilDue = getDaysUntilDue(task.dueDate)
          const isSelected = task.selectedForScheduling

          return (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
              )}
              onClick={() => toggleTaskSelection(task.id)}
            >
              <Checkbox checked={isSelected} onChange={() => {}} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getTypeIcon(task.type)}
                  <span className="font-medium truncate">{task.title}</span>
                  {task.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <span>Due: {task.dueDate.toLocaleDateString()}</span>
                  <span className={cn(
                    daysUntilDue < 0 ? "text-red-600" : 
                    daysUntilDue <= 1 ? "text-orange-600" : 
                    "text-gray-600"
                  )}>
                    ({daysUntilDue < 0 ? "Overdue" : daysUntilDue === 0 ? "Due today" : `${daysUntilDue} days left`})
                  </span>
                  {task.estimatedHours && (
                    <span>• {task.estimatedHours}h estimated</span>
                  )}
                </div>
                
                {task.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="space-y-2">
            <p className="font-medium">No tasks available for scheduling</p>
            <p className="text-sm">
              {tasks.length === 0 
                ? "Create some tasks first in the Tasks section"
                : "Try adjusting your filters or check if tasks are overdue"
              }
            </p>
            {tasks.length > 0 && (
              <p className="text-xs text-gray-400">
                Total tasks: {tasks.length} | Filtered: {filteredTasks.length}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
          Done ({selectedTasks.length} selected)
        </Button>
      </div>
    </div>
  )
}

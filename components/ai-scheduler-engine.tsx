"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Clock, Target, AlertTriangle, CheckCircle, Calendar, Zap, BarChart3, Lightbulb } from "lucide-react"
import { AIScheduler } from "@/lib/ai-scheduler"

interface Assignment {
  id: number
  title: string
  course: string
  dueDate: string
  priority: "low" | "medium" | "high"
  estimatedHours: number
  completed: boolean
}

interface PersonalTask {
  id: number
  title: string
  description?: string
  category: string
  priority: "low" | "medium" | "high"
  dueDate?: string
  estimatedTime?: number
  completed: boolean
  createdAt: string
}

interface StudySession {
  id: number
  title: string
  assignmentId?: number
  taskId?: number
  date: string
  time: string
  duration: number
  type: "study" | "task" | "break"
  priority: "low" | "medium" | "high"
  confidence: number
}

interface AISchedulerEngineProps {
  assignments: Assignment[]
  personalTasks: PersonalTask[]
  onScheduleGenerated: (sessions: StudySession[]) => void
}

export function AISchedulerEngine({ assignments, personalTasks, onScheduleGenerated }: AISchedulerEngineProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSessions, setGeneratedSessions] = useState<StudySession[]>([])
  const [insights, setInsights] = useState<any>(null)
  const [generationStep, setGenerationStep] = useState("")

  const scheduler = new AIScheduler()

  const generateSchedule = async () => {
    setIsGenerating(true)
    setGenerationStep("Analyzing your calendar...")

    // Simulate AI processing steps
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setGenerationStep("Prioritizing assignments and tasks...")

    await new Promise((resolve) => setTimeout(resolve, 1000))
    setGenerationStep("Finding optimal time slots...")

    await new Promise((resolve) => setTimeout(resolve, 1000))
    setGenerationStep("Optimizing study sessions...")

    await new Promise((resolve) => setTimeout(resolve, 1000))
    setGenerationStep("Generating final schedule...")

    // Generate the actual schedule
    const sessions = scheduler.generateSchedule(assignments, personalTasks)
    const scheduleInsights = scheduler.getSchedulingInsights(sessions)

    setGeneratedSessions(sessions)
    setInsights(scheduleInsights)
    onScheduleGenerated(sessions)

    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsGenerating(false)
    setGenerationStep("")
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-500"
    if (confidence >= 0.6) return "text-yellow-500"
    return "text-red-500"
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High Confidence"
    if (confidence >= 0.6) return "Medium Confidence"
    return "Low Confidence"
  }

  return (
    <div className="space-y-6">
      {/* AI Engine Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">AI Scheduling Engine</CardTitle>
              <CardDescription>
                Intelligent algorithm that analyzes your calendar, priorities, and deadlines to create optimal study
                sessions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{assignments.filter((a) => !a.completed).length}</div>
                <div className="text-sm text-muted-foreground">Assignments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{personalTasks.filter((t) => !t.completed).length}</div>
                <div className="text-sm text-muted-foreground">Personal Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-3">{generatedSessions.length}</div>
                <div className="text-sm text-muted-foreground">Sessions Planned</div>
              </div>
            </div>
            <Button
              onClick={generateSchedule}
              disabled={isGenerating}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <Brain className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Generate Smart Schedule
                </>
              )}
            </Button>
          </div>

          {isGenerating && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="w-4 h-4 animate-pulse" />
                {generationStep}
              </div>
              <Progress value={generationStep ? 75 : 25} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Schedule Results */}
      {generatedSessions.length > 0 && insights && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insights.totalHours.toFixed(1)}h</div>
                  <p className="text-xs text-muted-foreground">Across {generatedSessions.length} sessions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Schedule Confidence</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getConfidenceColor(insights.averageConfidence)}`}>
                    {Math.round(insights.averageConfidence * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">{getConfidenceLabel(insights.averageConfidence)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Peak Study Day</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.max(...Object.values(insights.workloadDistribution)).toFixed(1)}h
                  </div>
                  <p className="text-xs text-muted-foreground">Maximum daily workload</p>
                </CardContent>
              </Card>
            </div>

            {/* Workload Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Workload Distribution</CardTitle>
                <CardDescription>How your study time is distributed across the week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(insights.workloadDistribution).map(([date, hours]) => (
                    <div key={date} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex-1">
                        <Progress
                          value={(hours / Math.max(...Object.values(insights.workloadDistribution))) * 100}
                          className="h-2"
                        />
                      </div>
                      <div className="w-12 text-sm text-muted-foreground">{hours.toFixed(1)}h</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generated Study Sessions</CardTitle>
                <CardDescription>AI-optimized schedule based on your priorities and available time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {session.type === "study" ? (
                            <Brain className="w-5 h-5 text-primary" />
                          ) : (
                            <Target className="w-5 h-5 text-accent" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{session.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(session.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.time} ({session.duration}m)
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            session.priority === "high"
                              ? "border-red-500/20 text-red-500"
                              : session.priority === "medium"
                                ? "border-yellow-500/20 text-yellow-500"
                                : "border-green-500/20 text-green-500"
                          }
                        >
                          {session.priority}
                        </Badge>
                        <Badge variant="secondary" className={getConfidenceColor(session.confidence)}>
                          {Math.round(session.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>Personalized insights to optimize your study schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.recommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                  {insights.recommendations.length === 0 && (
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <p className="text-sm">Your schedule looks well-balanced! No major adjustments needed.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule Analysis</CardTitle>
                <CardDescription>Detailed breakdown of your AI-generated schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Session Types</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Study Sessions</span>
                        <span className="text-sm font-medium">
                          {generatedSessions.filter((s) => s.type === "study").length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Personal Tasks</span>
                        <span className="text-sm font-medium">
                          {generatedSessions.filter((s) => s.type === "task").length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Priority Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">High Priority</span>
                        <span className="text-sm font-medium text-red-500">
                          {generatedSessions.filter((s) => s.priority === "high").length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Medium Priority</span>
                        <span className="text-sm font-medium text-yellow-500">
                          {generatedSessions.filter((s) => s.priority === "medium").length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Low Priority</span>
                        <span className="text-sm font-medium text-green-500">
                          {generatedSessions.filter((s) => s.priority === "low").length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

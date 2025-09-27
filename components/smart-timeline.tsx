"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, CheckCircle, X, Brain, Target, AlertCircle, TrendingUp } from "lucide-react"
import { SyncManager } from "@/components/sync-manager"

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

interface SmartTimelineProps {
  sessions: StudySession[]
  onApprove?: (sessionId: number) => void
  onReject?: (sessionId: number) => void
  onApproveAll?: () => void
}

export function SmartTimeline({ sessions, onApprove, onReject, onApproveAll }: SmartTimelineProps) {
  const [approvedSessions, setApprovedSessions] = useState<Set<number>>(new Set())
  const [rejectedSessions, setRejectedSessions] = useState<Set<number>>(new Set())
  const [showSyncManager, setShowSyncManager] = useState(false)

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-500"
    if (confidence >= 0.6) return "text-yellow-500"
    return "text-red-500"
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <TrendingUp className="w-3 h-3" />
    if (confidence >= 0.6) return <AlertCircle className="w-3 h-3" />
    return <AlertCircle className="w-3 h-3" />
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "study":
        return <Brain className="w-4 h-4 text-primary" />
      case "task":
        return <Target className="w-4 h-4 text-accent" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const handleApprove = (sessionId: number) => {
    setApprovedSessions(new Set([...approvedSessions, sessionId]))
    setRejectedSessions(new Set([...rejectedSessions].filter((id) => id !== sessionId)))
    onApprove?.(sessionId)
  }

  const handleReject = (sessionId: number) => {
    setRejectedSessions(new Set([...rejectedSessions, sessionId]))
    setApprovedSessions(new Set([...approvedSessions].filter((id) => id !== sessionId)))
    onReject?.(sessionId)
  }

  const handleApproveAll = () => {
    const allSessionIds = sessions.map((s) => s.id)
    setApprovedSessions(new Set(allSessionIds))
    setRejectedSessions(new Set())
    onApproveAll?.()
  }

  // Group sessions by date
  const sessionsByDate = sessions.reduce(
    (acc, session) => {
      if (!acc[session.date]) {
        acc[session.date] = []
      }
      acc[session.date].push(session)
      return acc
    },
    {} as Record<string, StudySession[]>,
  )

  // Sort dates
  const sortedDates = Object.keys(sessionsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  const totalApproved = approvedSessions.size
  const totalSessions = sessions.length
  const averageConfidence = sessions.reduce((sum, s) => sum + s.confidence, 0) / sessions.length || 0

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Smart Study Timeline
              </CardTitle>
              <CardDescription>Review and approve your AI-generated study schedule</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{totalApproved}</div>
                <div className="text-xs text-muted-foreground">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{totalSessions}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getConfidenceColor(averageConfidence)}`}>
                  {Math.round(averageConfidence * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Confidence</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline */}
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <Card key={date}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(date)}
                <Badge variant="outline" className="ml-2">
                  {sessionsByDate[date].length} sessions
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessionsByDate[date]
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((session, index) => {
                    const isApproved = approvedSessions.has(session.id)
                    const isRejected = rejectedSessions.has(session.id)

                    return (
                      <div key={session.id} className="relative">
                        {/* Timeline line */}
                        {index < sessionsByDate[date].length - 1 && (
                          <div className="absolute left-6 top-16 w-0.5 h-8 bg-border" />
                        )}

                        <div
                          className={`flex items-start gap-4 p-4 border rounded-lg transition-all ${
                            isApproved
                              ? "border-green-500/30 bg-green-500/5"
                              : isRejected
                                ? "border-red-500/30 bg-red-500/5 opacity-60"
                                : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center flex-shrink-0 border">
                            {getTypeIcon(session.type)}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-balance">{session.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                  <span>{formatTime(session.time)}</span>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {session.duration} minutes
                                  </div>
                                  <div className={`flex items-center gap-1 ${getConfidenceColor(session.confidence)}`}>
                                    {getConfidenceIcon(session.confidence)}
                                    {Math.round(session.confidence * 100)}% confidence
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {!isApproved && !isRejected && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleApprove(session.id)}
                                      className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReject(session.id)}
                                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                {isApproved && (
                                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Approved
                                  </Badge>
                                )}
                                {isRejected && (
                                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                                    <X className="w-3 h-3 mr-1" />
                                    Rejected
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(session.priority)}>{session.priority} priority</Badge>
                              <Badge variant="secondary" className="text-xs">
                                AI Generated
                              </Badge>
                              <Badge
                                variant="outline"
                                className={session.type === "study" ? "text-primary" : "text-accent"}
                              >
                                {session.type === "study" ? "Study Session" : "Personal Task"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      {sessions.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {totalApproved} of {totalSessions} sessions approved
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setApprovedSessions(new Set())}>
                  Clear All
                </Button>
                <Button onClick={handleApproveAll} disabled={totalApproved === totalSessions}>
                  Approve All
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  disabled={totalApproved === 0}
                  onClick={() => setShowSyncManager(true)}
                >
                  Sync {totalApproved} Sessions to Calendar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Manager */}
      {showSyncManager && totalApproved > 0 && (
        <SyncManager
          sessions={sessions}
          approvedSessions={approvedSessions}
          onSyncComplete={(syncedSessions) => {
            console.log("Synced sessions:", syncedSessions)
            setShowSyncManager(false)
          }}
        />
      )}

      {sessions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Study Sessions Generated</h3>
            <p className="text-muted-foreground">
              Use the AI Engine to generate your personalized study timeline based on your assignments and calendar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

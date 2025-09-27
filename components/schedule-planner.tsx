"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Edit, Trash2, Calendar, Brain, CheckCircle2 } from "lucide-react"

interface ScheduleItem {
  id: number
  title: string
  description: string
  startTime: string
  endTime: string
  duration: number
  type: "study" | "assignment" | "personal" | "break"
  priority: "low" | "medium" | "high"
  subject?: string
  confidence: number
  status: "pending" | "approved" | "completed"
}

interface SchedulePlannerProps {
  sessions: ScheduleItem[]
  onUpdateSession: (id: number, updates: Partial<ScheduleItem>) => void
  onDeleteSession: (id: number) => void
}

export function SchedulePlanner({ sessions, onUpdateSession, onDeleteSession }: SchedulePlannerProps) {
  const [editingSession, setEditingSession] = useState<ScheduleItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleEditSession = (session: ScheduleItem) => {
    setEditingSession(session)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingSession) {
      onUpdateSession(editingSession.id, editingSession)
      setIsEditDialogOpen(false)
      setEditingSession(null)
    }
  }

  const handleDeleteSession = (id: number) => {
    onDeleteSession(id)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "study":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "assignment":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "personal":
        return "bg-green-100 text-green-800 border-green-200"
      case "break":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatTime = (time: string) => {
    return new Date(`2024-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const groupedSessions = sessions.reduce(
    (acc, session) => {
      const date = session.startTime.split("T")[0]
      if (!acc[date]) acc[date] = []
      acc[date].push(session)
      return acc
    },
    {} as Record<string, ScheduleItem[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Tentative Schedule</h2>
          <p className="text-muted-foreground">AI-generated study plan optimized for your calendar</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50">
            <Brain className="w-3 h-3 mr-1" />
            {sessions.length} AI Sessions
          </Badge>
        </div>
      </div>

      {Object.keys(groupedSessions).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Schedule Generated</h3>
            <p className="text-muted-foreground text-center">
              Use the AI Engine to generate your personalized study schedule
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSessions).map(([date, daySessions]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
                <CardDescription>
                  {daySessions.length} sessions planned • {daySessions.reduce((acc, s) => acc + s.duration, 0)} minutes
                  total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {daySessions
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{session.title}</h4>
                            <Badge className={getTypeColor(session.type)}>{session.type}</Badge>
                            <Badge className={getPriorityColor(session.priority)}>{session.priority}</Badge>
                            {session.confidence && (
                              <Badge variant="outline" className="bg-green-50">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {session.confidence}% confidence
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">{session.description}</p>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(session.startTime.split("T")[1])} -{" "}
                              {formatTime(session.endTime.split("T")[1])}
                            </div>
                            <div>{session.duration} minutes</div>
                            {session.subject && <div>Subject: {session.subject}</div>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => handleEditSession(session)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Study Session</DialogTitle>
            <DialogDescription>Make changes to your study session. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {editingSession && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={editingSession.title}
                  onChange={(e) => setEditingSession({ ...editingSession, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editingSession.description}
                  onChange={(e) => setEditingSession({ ...editingSession, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration (min)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={editingSession.duration}
                  onChange={(e) => setEditingSession({ ...editingSession, duration: Number.parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <Select
                  value={editingSession.priority}
                  onValueChange={(value) => setEditingSession({ ...editingSession, priority: value as any })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleSaveEdit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

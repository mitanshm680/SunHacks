"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Calendar, Clock, Brain, Target, Filter, Grid3X3, List } from "lucide-react"

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

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  type: "busy" | "class" | "assignment" | "personal"
  color?: string
}

interface CalendarViewProps {
  sessions: StudySession[]
  onSessionUpdate?: (session: StudySession) => void
}

export function CalendarView({ sessions, onSessionUpdate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"week" | "month">("week")
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState({
    study: true,
    task: true,
    high: true,
    medium: true,
    low: true,
  })

  // Mock existing calendar events (from Google Calendar)
  const existingEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "Math Class",
      start: "2024-01-15T10:00:00",
      end: "2024-01-15T11:30:00",
      type: "class",
      color: "bg-blue-500",
    },
    {
      id: "2",
      title: "Physics Lab",
      start: "2024-01-16T14:00:00",
      end: "2024-01-16T17:00:00",
      type: "class",
      color: "bg-green-500",
    },
    {
      id: "3",
      title: "Lunch with friends",
      start: "2024-01-17T12:00:00",
      end: "2024-01-17T13:30:00",
      type: "personal",
      color: "bg-purple-500",
    },
    {
      id: "4",
      title: "History Essay Due",
      start: "2024-01-18T23:59:00",
      end: "2024-01-18T23:59:00",
      type: "assignment",
      color: "bg-red-500",
    },
  ]

  const getWeekDays = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    const endDate = new Date(lastDay)

    // Adjust to show full weeks
    startDate.setDate(startDate.getDate() - startDate.getDay())
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const days = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return days
  }

  const getSessionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return sessions.filter((session) => {
      if (session.date !== dateStr) return false
      if (!filters[session.type]) return false
      if (!filters[session.priority]) return false
      return true
    })
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return existingEvents.filter((event) => {
      const eventDate = new Date(event.start).toISOString().split("T")[0]
      return eventDate === dateStr
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "study":
        return <Brain className="w-3 h-3" />
      case "task":
        return <Target className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const weekDays = getWeekDays(currentDate)
  const monthDays = getMonthDays(currentDate)

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Smart Calendar
              </CardTitle>
              <CardDescription>
                Your integrated schedule with AI-generated study sessions and existing commitments
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(value: "week" | "month") => setViewMode(value)}>
                <TabsList>
                  <TabsTrigger value="week" className="flex items-center gap-1">
                    <List className="w-4 h-4" />
                    Week
                  </TabsTrigger>
                  <TabsTrigger value="month" className="flex items-center gap-1">
                    <Grid3X3 className="w-4 h-4" />
                    Month
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm" onClick={() => setShowFilter(!showFilter)}>
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <h3 className="text-lg font-semibold">
                {viewMode === "week"
                  ? `${weekDays[0].toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })} - ${weekDays[6].toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}`
                  : currentDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
              </h3>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
          </div>

          {/* Filters */}
          {showFilter && (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Show:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={filters.study ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, study: !filters.study })}
                >
                  <Brain className="w-3 h-3 mr-1" />
                  Study
                </Button>
                <Button
                  variant={filters.task ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, task: !filters.task })}
                >
                  <Target className="w-3 h-3 mr-1" />
                  Tasks
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={filters.high ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, high: !filters.high })}
                  className="text-red-500 border-red-500/20"
                >
                  High
                </Button>
                <Button
                  variant={filters.medium ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, medium: !filters.medium })}
                  className="text-yellow-500 border-yellow-500/20"
                >
                  Medium
                </Button>
                <Button
                  variant={filters.low ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, low: !filters.low })}
                  className="text-green-500 border-green-500/20"
                >
                  Low
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {viewMode === "week" ? (
            <div className="grid grid-cols-8 min-h-[600px]">
              {/* Time column */}
              <div className="border-r border-border">
                <div className="h-12 border-b border-border flex items-center justify-center text-sm font-medium">
                  Time
                </div>
                {Array.from({ length: 14 }, (_, i) => i + 8).map((hour) => (
                  <div key={hour} className="h-12 border-b border-border flex items-center justify-center text-xs">
                    {hour % 12 || 12}:00 {hour >= 12 ? "PM" : "AM"}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day, dayIndex) => (
                <div key={dayIndex} className="border-r border-border last:border-r-0">
                  <div
                    className={`h-12 border-b border-border flex flex-col items-center justify-center text-sm ${
                      isToday(day) ? "bg-primary/10 text-primary font-semibold" : ""
                    }`}
                  >
                    <span className="text-xs">
                      {day.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                    </span>
                    <span className={isToday(day) ? "text-primary" : ""}>{day.getDate()}</span>
                  </div>

                  {/* Time slots */}
                  <div className="relative">
                    {Array.from({ length: 14 }, (_, i) => i + 8).map((hour) => (
                      <div key={hour} className="h-12 border-b border-border" />
                    ))}

                    {/* Events and sessions */}
                    <div className="absolute inset-0 p-1">
                      {/* Existing events */}
                      {getEventsForDate(day).map((event) => {
                        const startTime = new Date(event.start)
                        const endTime = new Date(event.end)
                        const startHour = startTime.getHours()
                        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
                        const top = (startHour - 8) * 48 + (startTime.getMinutes() / 60) * 48
                        const height = duration * 48

                        return (
                          <div
                            key={event.id}
                            className={`absolute left-1 right-1 ${event.color} text-white text-xs p-1 rounded opacity-80`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="opacity-75">{formatTime(startTime.toTimeString().slice(0, 5))}</div>
                          </div>
                        )
                      })}

                      {/* AI-generated sessions */}
                      {getSessionsForDate(day).map((session) => {
                        const [hours, minutes] = session.time.split(":").map(Number)
                        const duration = session.duration / 60
                        const top = (hours - 8) * 48 + (minutes / 60) * 48
                        const height = duration * 48

                        return (
                          <div
                            key={session.id}
                            className="absolute left-1 right-1 bg-primary/20 border border-primary/30 text-primary text-xs p-1 rounded cursor-pointer hover:bg-primary/30 transition-colors"
                            style={{ top: `${top}px`, height: `${height}px` }}
                            onClick={() => onSessionUpdate?.(session)}
                          >
                            <div className="flex items-center gap-1">
                              {getTypeIcon(session.type)}
                              <span className="font-medium truncate">{session.title}</span>
                            </div>
                            <div className="opacity-75">{formatTime(session.time)}</div>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge className={`${getPriorityColor(session.priority)} text-xs px-1 py-0`}>
                                {session.priority}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {/* Month view header */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="h-12 border-b border-border flex items-center justify-center font-medium">
                  {day}
                </div>
              ))}

              {/* Month view days */}
              {monthDays.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`min-h-[120px] border-b border-r border-border last:border-r-0 p-2 ${
                    !isCurrentMonth(day) ? "bg-muted/30 text-muted-foreground" : ""
                  } ${isToday(day) ? "bg-primary/5" : ""}`}
                >
                  <div className={`text-sm font-medium mb-2 ${isToday(day) ? "text-primary" : ""}`}>
                    {day.getDate()}
                  </div>

                  {/* Events for this day */}
                  <div className="space-y-1">
                    {getEventsForDate(day)
                      .slice(0, 2)
                      .map((event) => (
                        <div key={event.id} className={`text-xs p-1 rounded ${event.color} text-white truncate`}>
                          {event.title}
                        </div>
                      ))}

                    {getSessionsForDate(day)
                      .slice(0, 3)
                      .map((session) => (
                        <div
                          key={session.id}
                          className="text-xs p-1 rounded bg-primary/20 text-primary border border-primary/30 truncate cursor-pointer hover:bg-primary/30 transition-colors"
                          onClick={() => onSessionUpdate?.(session)}
                        >
                          <div className="flex items-center gap-1">
                            {getTypeIcon(session.type)}
                            <span>{session.title}</span>
                          </div>
                        </div>
                      ))}

                    {/* Show more indicator */}
                    {getEventsForDate(day).length + getSessionsForDate(day).length > 5 && (
                      <div className="text-xs text-muted-foreground">
                        +{getEventsForDate(day).length + getSessionsForDate(day).length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span>Classes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>Labs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded" />
              <span>Personal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span>Deadlines</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary/20 border border-primary/30 rounded" />
              <span>AI Study Sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <span>Study</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              <span>Personal Tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary/10 rounded" />
              <span>Today</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

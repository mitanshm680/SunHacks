"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Clock, BookOpen, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: "assignment" | "study" | "personal" | "ai-suggested"
  course?: string
  description?: string
}

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Math 101 - Calculus Assignment",
    start: new Date(2024, 11, 15, 14, 0),
    end: new Date(2024, 11, 15, 15, 30),
    type: "assignment",
    course: "MATH 101",
    description: "Complete problems 1-20 from Chapter 5",
  },
  {
    id: "2",
    title: "Study Session: Physics",
    start: new Date(2024, 11, 16, 10, 0),
    end: new Date(2024, 11, 16, 12, 0),
    type: "study",
    course: "PHYS 201",
  },
  {
    id: "3",
    title: "AI Suggested: Review Chemistry Notes",
    start: new Date(2024, 11, 17, 15, 0),
    end: new Date(2024, 11, 17, 16, 30),
    type: "ai-suggested",
    course: "CHEM 101",
  },
  {
    id: "4",
    title: "Gym Workout",
    start: new Date(2024, 11, 18, 18, 0),
    end: new Date(2024, 11, 18, 19, 30),
    type: "personal",
  },
]

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"week" | "month">("week")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

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

    // Adjust to start from Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay())
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const days = []
    const current = new Date(startDate)
    while (current <= endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  }

  const getEventsForDay = (date: Date) => {
    return mockEvents.filter((event) => {
      const eventDate = new Date(event.start)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const getEventTypeColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "assignment":
        return "bg-app-peach/20 text-app-black border-app-peach/30"
      case "study":
        return "bg-app-blue/20 text-app-black border-app-blue/30"
      case "ai-suggested":
        return "bg-primary/20 text-primary-foreground border-primary/30"
      case "personal":
        return "bg-app-yellow/20 text-app-black border-app-yellow/30"
      default:
        return "bg-app-cream/20 text-app-black border-app-cream/30"
    }
  }

  const getEventIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "assignment":
        return <BookOpen className="h-3 w-3" />
      case "study":
        return <Clock className="h-3 w-3" />
      case "ai-suggested":
        return <Brain className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (view === "week") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const formatDateRange = () => {
    if (view === "week") {
      const weekDays = getWeekDays(currentDate)
      const start = weekDays[0]
      const end = weekDays[6]
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    } else {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    }
  }

  const weekDays = view === "week" ? getWeekDays(currentDate) : []
  const monthDays = view === "month" ? getMonthDays(currentDate) : []

  return (
    <div className="space-y-4">
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg">{formatDateRange()}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md border border-border/50 bg-muted/30">
                <Button
                  variant={view === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("week")}
                  className={cn(view === "week" && "bg-primary text-primary-foreground")}
                >
                  Week
                </Button>
                <Button
                  variant={view === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("month")}
                  className={cn(view === "month" && "bg-primary text-primary-foreground")}
                >
                  Month
                </Button>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="glass-effect">
        <CardContent className="p-0">
          {view === "week" ? (
            <div className="grid grid-cols-8 min-h-[500px]">
              {/* Time column */}
              <div className="border-r border-border/30 p-2">
                <div className="h-10 border-b border-border/20"></div>
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="h-10 border-b border-border/20 text-xs text-muted-foreground p-1">
                    {i + 8}:00
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day, dayIndex) => (
                <div key={dayIndex} className="border-r border-border/30 last:border-r-0">
                  {/* Day header */}
                  <div className="h-10 border-b border-border/30 p-2 bg-muted/20">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div
                        className={cn(
                          "text-sm font-medium",
                          day.toDateString() === new Date().toDateString() &&
                            "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center mx-auto text-xs",
                        )}
                      >
                        {day.getDate()}
                      </div>
                    </div>
                  </div>

                  {/* Time slots */}
                  <div className="relative">
                    {Array.from({ length: 12 }, (_, i) => (
                      <div key={i} className="h-10 border-b border-border/20"></div>
                    ))}

                    {/* Events */}
                    {getEventsForDay(day).map((event, eventIndex) => {
                      const startHour = event.start.getHours()
                      const startMinute = event.start.getMinutes()
                      const endHour = event.end.getHours()
                      const endMinute = event.end.getMinutes()
                      const top = (startHour - 8) * 40 + (startMinute * 40) / 60
                      const height = (endHour - startHour) * 40 + ((endMinute - startMinute) * 40) / 60

                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "absolute left-1 right-1 rounded border p-1 cursor-pointer hover:shadow-sm transition-shadow",
                            getEventTypeColor(event.type),
                          )}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            zIndex: 10 + eventIndex,
                          }}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-start gap-1">
                            {getEventIcon(event.type)}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium truncate">{event.title}</div>
                              <div className="text-xs opacity-75">
                                {event.start.toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {/* Month view header */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-medium text-muted-foreground border-b border-border/50"
                >
                  {day}
                </div>
              ))}

              {/* Month view days */}
              {monthDays.map((day, dayIndex) => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                const isToday = day.toDateString() === new Date().toDateString()
                const dayEvents = getEventsForDay(day)

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "min-h-[120px] p-2 border-b border-r border-border/50 last:border-r-0",
                      !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                    )}
                  >
                    <div
                      className={cn(
                        "text-sm font-medium mb-1",
                        isToday &&
                          "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center",
                      )}
                    >
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <Badge
                          key={event.id}
                          variant="secondary"
                          className={cn(
                            "text-xs px-1 py-0 h-5 cursor-pointer hover:opacity-80 block truncate",
                            getEventTypeColor(event.type),
                          )}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-center gap-1">
                            {getEventIcon(event.type)}
                            <span className="truncate">{event.title}</span>
                          </div>
                        </Badge>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Card className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-96 z-50 border-border/50 bg-card/95 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg", getEventTypeColor(selectedEvent.type))}>
                  {getEventIcon(selectedEvent.type)}
                </div>
                <div>
                  <CardTitle className="text-lg">{selectedEvent.title}</CardTitle>
                  {selectedEvent.course && <p className="text-sm text-muted-foreground">{selectedEvent.course}</p>}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {selectedEvent.start.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-4"></span>
              <span>
                {selectedEvent.start.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}{" "}
                -{" "}
                {selectedEvent.end.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
            {selectedEvent.description && (
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button size="sm" className="flex-1">
                Edit
              </Button>
              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backdrop for modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setSelectedEvent(null)} />
      )}
    </div>
  )
}

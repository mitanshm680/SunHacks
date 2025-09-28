"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCalendar } from '@/lib/calendar-context'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Clock, BookOpen, Brain, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { CanvasFeedManager } from './canvas-feed-manager'

// Use the CalendarEvent type from the context instead of defining our own
import { CalendarEvent } from '@/lib/calendar-context'

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

// Event layout calculation interface
interface EventLayout {
  event: CalendarEvent
  column: number
  totalColumns: number
  top: number
  height: number
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"week" | "month">("week")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const { events, setEvents } = useCalendar()

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
    return events.filter((event) => {
      const eventDate = new Date(event.start)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const getEventTypeColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "assignment":
        return "bg-orange-100 text-orange-900 border-orange-200"
      case "study":
        return "bg-blue-100 text-blue-900 border-blue-200"
      case "ai-suggested":
        return "bg-purple-100 text-purple-900 border-purple-200"
      case "personal":
        return "bg-green-100 text-green-900 border-green-200"
      case "work":
        return "bg-red-100 text-red-900 border-red-200"
      default:
        return "bg-gray-100 text-gray-900 border-gray-200"
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
      case "work":
        return <Calendar className="h-3 w-3" />
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

  // Calculate proper event layouts with overlap handling
  const calculateEventLayouts = (dayEvents: CalendarEvent[], startHour: number): EventLayout[] => {
    if (dayEvents.length === 0) return []

    const layouts: EventLayout[] = []
    const pixelsPerMinute = 1.2
    const hourHeight = 60 * pixelsPerMinute

    // Sort events by start time
    const sortedEvents = [...dayEvents].sort((a, b) => a.start.getTime() - b.start.getTime())

    // Group overlapping events
    const eventGroups: CalendarEvent[][] = []
    
    for (const event of sortedEvents) {
      let addedToGroup = false
      
      for (const group of eventGroups) {
        // Check if this event overlaps with any event in the group
        const overlaps = group.some(groupEvent => 
          event.start < groupEvent.end && event.end > groupEvent.start
        )
        
        if (overlaps) {
          group.push(event)
          addedToGroup = true
          break
        }
      }
      
      if (!addedToGroup) {
        eventGroups.push([event])
      }
    }

    // Calculate layouts for each group
    eventGroups.forEach(group => {
      const totalColumns = group.length
      
      group.forEach((event, index) => {
        const startMinutes = (event.start.getHours() - startHour) * 60 + event.start.getMinutes()
        const durationMinutes = (event.end.getTime() - event.start.getTime()) / 60000
        
        // FIXED: Detect single-time events and give them short duration
        const isSingleTimeEvent = durationMinutes < 5 || 
                                 durationMinutes === 0 || 
                                 event.title.toLowerCase().includes('home') ||
                                 event.title.toLowerCase().includes('pay') ||
                                 event.title.toLowerCase().includes('rent') ||
                                 event.title.toLowerCase().includes('quick')
        const adjustedDurationMinutes = isSingleTimeEvent ? 3 : durationMinutes // 3 minutes for single-time events
        
        const top = Math.max(0, startMinutes * pixelsPerMinute)
        const height = Math.max(40, adjustedDurationMinutes * pixelsPerMinute) // Minimum 40px for short events
        
        layouts.push({
          event,
          column: index,
          totalColumns,
          top,
          height
        })
      })
    })

    return layouts
  }

  // Get visible time range based on events
  const getVisibleRange = (eventsForDay: CalendarEvent[]) => {
    if (!eventsForDay || eventsForDay.length === 0) {
      return { startHour: 9, endHour: 17 } // Default business hours
    }
    
    const earliest = Math.min(...eventsForDay.map(e => e.start.getHours()))
    const latest = Math.max(...eventsForDay.map(e => e.end.getHours()))
    
    // Add padding and ensure reasonable bounds
    return { 
      startHour: Math.max(6, earliest - 1), 
      endHour: Math.min(23, latest + 1) 
    }
  }

  const weekDays = view === "week" ? getWeekDays(currentDate) : []
  const monthDays = view === "month" ? getMonthDays(currentDate) : []

  // Calculate global time range for consistent layout across all days
  const allWeekEvents = weekDays.flatMap(day => getEventsForDay(day))
  const globalTimeRange = getVisibleRange(allWeekEvents)
  const totalHours = globalTimeRange.endHour - globalTimeRange.startHour
  const pixelsPerMinute = 1.2
  const totalHeight = totalHours * 60 * pixelsPerMinute

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
              <CanvasFeedManager />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="glass-effect">
        <CardContent className="p-0">
          {view === "week" ? (
            <div className="flex flex-col">
              {/* Week view header */}
              <div className="flex border-b border-border/30 bg-muted/20 sticky top-0 z-30">
                {/* Time column header */}
                <div className="w-20 flex-shrink-0 p-3 border-r border-border/30">
                  <div className="text-xs text-muted-foreground">Time</div>
                </div>
                
                {/* Day headers */}
                {weekDays.map((day, dayIndex) => (
                  <div key={dayIndex} className="flex-1 p-3 border-r border-border/30 last:border-r-0 min-w-32">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div
                        className={cn(
                          "text-sm font-medium",
                          day.toDateString() === new Date().toDateString() &&
                            "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto"
                        )}
                      >
                        {day.getDate()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Week view content - scrollable */}
              <div className="flex overflow-y-auto" style={{ maxHeight: '70vh' }}>
                {/* Time column */}
                <div className="w-20 flex-shrink-0 border-r border-border/30 bg-card relative">
                  {Array.from({ length: totalHours }, (_, i) => {
                    const hour = globalTimeRange.startHour + i
                    const y = i * 60 * pixelsPerMinute
                    
                    return (
                      <div
                        key={hour}
                        className="absolute left-0 right-0 text-xs text-muted-foreground px-2 py-1 border-b border-border/10"
                        style={{ 
                          top: `${y}px`, 
                          height: `${60 * pixelsPerMinute}px`,
                          display: 'flex',
                          alignItems: 'flex-start'
                        }}
                      >
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                      </div>
                    )
                  })}
                  
                  {/* Total height spacer */}
                  <div style={{ height: `${totalHeight}px` }} />
                </div>

                {/* Day columns */}
                {weekDays.map((day, dayIndex) => {
                  const eventsForDay = getEventsForDay(day)
                  const eventLayouts = calculateEventLayouts(eventsForDay, globalTimeRange.startHour)

                  return (
                    <div 
                      key={dayIndex} 
                      className="flex-1 border-r border-border/30 last:border-r-0 relative min-w-32"
                      style={{ height: `${totalHeight}px` }}
                    >
                      {/* Hour grid lines */}
                      {Array.from({ length: totalHours }, (_, i) => (
                        <div
                          key={i}
                          className="absolute left-0 right-0 border-b border-border/10"
                          style={{ 
                            top: `${i * 60 * pixelsPerMinute}px`,
                            height: '1px'
                          }}
                        />
                      ))}

                      {/* Events */}
                      {eventLayouts.map(({ event, column, totalColumns, top, height }) => {
                        const width = totalColumns === 1 ? '90%' : `${90 / totalColumns}%`
                        const left = totalColumns === 1 ? '5%' : `${(90 / totalColumns) * column + 5}%`
                        
                        // Detect if this is a quick task (single-time event)
                        const durationMinutes = (event.end.getTime() - event.start.getTime()) / 60000
                        
                        // Enhanced detection: check duration, title patterns, and event type
                        const isQuickTask = durationMinutes < 5 || 
                                          durationMinutes === 0 || 
                                          event.title.toLowerCase().includes('home') ||
                                          event.title.toLowerCase().includes('pay') ||
                                          event.title.toLowerCase().includes('rent') ||
                                          event.title.toLowerCase().includes('quick')
                        
                        // DEBUG: Log event details for debugging
                        console.log(`Event: ${event.title}, Duration: ${durationMinutes}min, IsQuick: ${isQuickTask}`)

                        return (
                          <div
                            key={event.id}
                            className={cn(
                              "absolute rounded-lg border cursor-pointer hover:shadow-md transition-shadow",
                              "p-3 overflow-hidden",
                              isQuickTask && "border-dashed border-2", // Dashed border for quick tasks
                              getEventTypeColor(event.type)
                            )}
                            style={{
                              top: `${top}px`,
                              left,
                              width,
                              height: `${height}px`,
                              minHeight: isQuickTask ? '40px' : '80px', // Smaller min height for quick tasks
                              zIndex: 20 + column
                            }}
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className="flex items-start gap-2 h-full">
                              <div className="flex-shrink-0 mt-0.5">
                                {getEventIcon(event.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm leading-tight mb-1 break-words">
                                  {event.title}
                                  {isQuickTask && <span className="text-xs opacity-60 ml-1">(quick)</span>}
                                </div>
                                <div className="text-xs opacity-80 mb-1">
                                  {event.start.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit',
                                    hour12: true 
                                  })}
                                  {isQuickTask && <span className="ml-1 text-xs opacity-60">(3min)</span>}
                                </div>
                                {event.course && (
                                  <div className="text-xs opacity-70 truncate">
                                    {event.course}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
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
                      !isCurrentMonth && "bg-muted/20 text-muted-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "text-sm font-medium mb-1",
                        isToday &&
                          "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                      )}
                    >
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity",
                            "flex items-center gap-1 min-h-[24px] overflow-hidden",
                            getEventTypeColor(event.type)
                          )}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex-shrink-0">{getEventIcon(event.type)}</div>
                          <span className="truncate font-medium">{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Modal - unchanged */}
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
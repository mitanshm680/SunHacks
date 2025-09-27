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

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  type: "busy" | "free"
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

interface SchedulingPreferences {
  preferredStudyHours: {
    start: string
    end: string
  }
  maxSessionDuration: number
  minBreakBetweenSessions: number
  preferredDays: string[]
  avoidLateNight: boolean
}

export class AIScheduler {
  private preferences: SchedulingPreferences = {
    preferredStudyHours: { start: "09:00", end: "22:00" },
    maxSessionDuration: 120,
    minBreakBetweenSessions: 15,
    preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    avoidLateNight: true,
  }

  // Simulate getting calendar events from Google Calendar
  private getCalendarEvents(): CalendarEvent[] {
    return [
      {
        id: "1",
        title: "Math Class",
        start: "2024-01-15T10:00:00",
        end: "2024-01-15T11:30:00",
        type: "busy",
      },
      {
        id: "2",
        title: "Lunch",
        start: "2024-01-15T12:00:00",
        end: "2024-01-15T13:00:00",
        type: "busy",
      },
      {
        id: "3",
        title: "Physics Lab",
        start: "2024-01-16T14:00:00",
        end: "2024-01-16T17:00:00",
        type: "busy",
      },
      {
        id: "4",
        title: "Study Group",
        start: "2024-01-17T19:00:00",
        end: "2024-01-17T21:00:00",
        type: "busy",
      },
    ]
  }

  // Find free time slots in the calendar
  private findFreeSlots(startDate: Date, endDate: Date): { start: Date; end: Date }[] {
    const calendarEvents = this.getCalendarEvents()
    const freeSlots: { start: Date; end: Date }[] = []

    // Generate potential time slots for each day
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate)
      const [startHour, startMinute] = this.preferences.preferredStudyHours.start.split(":").map(Number)
      dayStart.setHours(startHour, startMinute, 0, 0)

      const dayEnd = new Date(currentDate)
      const [endHour, endMinute] = this.preferences.preferredStudyHours.end.split(":").map(Number)
      dayEnd.setHours(endHour, endMinute, 0, 0)

      // Find busy periods for this day
      const dayEvents = calendarEvents.filter((event) => {
        const eventStart = new Date(event.start)
        return eventStart.toDateString() === currentDate.toDateString()
      })

      // Create free slots between busy periods
      let slotStart = new Date(dayStart)
      for (const event of dayEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())) {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)

        if (slotStart < eventStart) {
          freeSlots.push({ start: new Date(slotStart), end: new Date(eventStart) })
        }
        slotStart = new Date(Math.max(eventEnd.getTime(), slotStart.getTime()))
      }

      // Add final slot if there's time left in the day
      if (slotStart < dayEnd) {
        freeSlots.push({ start: new Date(slotStart), end: new Date(dayEnd) })
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return freeSlots.filter((slot) => slot.end.getTime() - slot.start.getTime() >= 30 * 60 * 1000) // At least 30 minutes
  }

  // Calculate priority score for scheduling
  private calculatePriorityScore(item: Assignment | PersonalTask, dueDate: Date, currentDate: Date): number {
    const daysUntilDue = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
    let score = 0

    // Base priority score
    switch (item.priority) {
      case "high":
        score += 100
        break
      case "medium":
        score += 50
        break
      case "low":
        score += 25
        break
    }

    // Urgency multiplier
    if (daysUntilDue <= 1) score *= 3
    else if (daysUntilDue <= 3) score *= 2
    else if (daysUntilDue <= 7) score *= 1.5

    // Assignment vs personal task weight
    if ("course" in item) score *= 1.2 // Assignments get slight priority

    return score
  }

  // Break down large tasks into smaller sessions
  private breakDownTask(item: Assignment | PersonalTask, totalMinutes: number): { title: string; duration: number }[] {
    const sessions: { title: string; duration: number }[] = []
    const maxDuration = this.preferences.maxSessionDuration

    if (totalMinutes <= maxDuration) {
      return [{ title: item.title, duration: totalMinutes }]
    }

    // Break into multiple sessions
    const numSessions = Math.ceil(totalMinutes / maxDuration)
    const sessionDuration = Math.floor(totalMinutes / numSessions)

    if ("course" in item) {
      // For assignments, create logical breakdowns
      const phases = ["Research & Planning", "Writing/Work", "Review & Polish"]
      for (let i = 0; i < numSessions; i++) {
        const phase = phases[Math.min(i, phases.length - 1)]
        sessions.push({
          title: `${item.title} - ${phase}`,
          duration: i === numSessions - 1 ? totalMinutes - sessionDuration * i : sessionDuration,
        })
      }
    } else {
      // For personal tasks, just split by time
      for (let i = 0; i < numSessions; i++) {
        sessions.push({
          title: `${item.title} ${numSessions > 1 ? `(Part ${i + 1})` : ""}`,
          duration: i === numSessions - 1 ? totalMinutes - sessionDuration * i : sessionDuration,
        })
      }
    }

    return sessions
  }

  // Main scheduling algorithm
  public generateSchedule(
    assignments: Assignment[],
    personalTasks: PersonalTask[],
    startDate: Date = new Date(),
    daysAhead = 14,
  ): StudySession[] {
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + daysAhead)

    const freeSlots = this.findFreeSlots(startDate, endDate)
    const studySessions: StudySession[] = []

    // Combine and prioritize all items
    const allItems: (Assignment | PersonalTask)[] = [
      ...assignments.filter((a) => !a.completed),
      ...personalTasks.filter((t) => !t.completed),
    ]

    // Sort by priority and due date
    const prioritizedItems = allItems
      .map((item) => {
        const dueDate = new Date(item.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        return {
          item,
          dueDate,
          priorityScore: this.calculatePriorityScore(item, dueDate, startDate),
        }
      })
      .sort((a, b) => b.priorityScore - a.priorityScore)

    let sessionId = 1
    const usedSlots: { start: Date; end: Date }[] = []

    // Schedule each item
    for (const { item, dueDate } of prioritizedItems) {
      const totalMinutes = "estimatedHours" in item ? item.estimatedHours * 60 : item.estimatedTime || 60
      const sessions = this.breakDownTask(item, totalMinutes)

      for (const session of sessions) {
        // Find the best available slot
        const availableSlots = freeSlots.filter((slot) => {
          const slotDuration = slot.end.getTime() - slot.start.getTime()
          const requiredDuration = session.duration * 60 * 1000 + this.preferences.minBreakBetweenSessions * 60 * 1000

          // Check if slot is big enough and not already used
          if (slotDuration < requiredDuration) return false

          // Check for conflicts with already scheduled sessions
          return !usedSlots.some(
            (used) =>
              (slot.start >= used.start && slot.start < used.end) || (slot.end > used.start && slot.end <= used.end),
          )
        })

        if (availableSlots.length === 0) continue

        // Choose the best slot (prefer earlier in the day, closer to due date)
        const bestSlot = availableSlots.reduce((best, current) => {
          const currentDaysToDue = Math.ceil((dueDate.getTime() - current.start.getTime()) / (1000 * 60 * 60 * 24))
          const bestDaysToDue = Math.ceil((dueDate.getTime() - best.start.getTime()) / (1000 * 60 * 60 * 24))

          // Prefer slots closer to due date, but not too close
          if (currentDaysToDue >= 1 && currentDaysToDue < bestDaysToDue) return current
          if (bestDaysToDue < 1 && currentDaysToDue >= 1) return current

          // If same day preference, prefer earlier time
          if (Math.abs(currentDaysToDue - bestDaysToDue) <= 1) {
            return current.start < best.start ? current : best
          }

          return best
        })

        // Schedule the session
        const sessionStart = new Date(bestSlot.start)
        const sessionEnd = new Date(sessionStart.getTime() + session.duration * 60 * 1000)

        studySessions.push({
          id: sessionId++,
          title: session.title,
          assignmentId: "course" in item ? item.id : undefined,
          taskId: "course" in item ? undefined : item.id,
          date: sessionStart.toISOString().split("T")[0],
          time: sessionStart.toTimeString().slice(0, 5),
          duration: session.duration,
          type: "course" in item ? "study" : "task",
          priority: item.priority,
          confidence: this.calculateConfidence(sessionStart, dueDate, session.duration),
        })

        // Mark this time slot as used
        usedSlots.push({
          start: sessionStart,
          end: new Date(sessionEnd.getTime() + this.preferences.minBreakBetweenSessions * 60 * 1000),
        })
      }
    }

    return studySessions.sort(
      (a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime(),
    )
  }

  // Calculate confidence score for a scheduled session
  private calculateConfidence(sessionDate: Date, dueDate: Date, duration: number): number {
    const daysUntilDue = Math.ceil((dueDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
    let confidence = 0.8 // Base confidence

    // Adjust based on timing
    if (daysUntilDue >= 3) confidence += 0.1 // Good advance planning
    if (daysUntilDue <= 1) confidence -= 0.2 // Last minute scheduling

    // Adjust based on session length
    if (duration <= 90) confidence += 0.1 // Optimal session length
    if (duration > 120) confidence -= 0.1 // Too long

    // Adjust based on time of day
    const hour = sessionDate.getHours()
    if (hour >= 9 && hour <= 11) confidence += 0.1 // Morning focus time
    if (hour >= 14 && hour <= 16) confidence += 0.05 // Afternoon focus time
    if (hour >= 20) confidence -= 0.1 // Evening fatigue

    return Math.max(0.3, Math.min(1.0, confidence))
  }

  // Get scheduling insights and recommendations
  public getSchedulingInsights(sessions: StudySession[]): {
    totalHours: number
    averageConfidence: number
    recommendations: string[]
    workloadDistribution: { [key: string]: number }
  } {
    const totalHours = sessions.reduce((sum, session) => sum + session.duration / 60, 0)
    const averageConfidence = sessions.reduce((sum, session) => sum + session.confidence, 0) / sessions.length || 0

    const recommendations: string[] = []
    const workloadDistribution: { [key: string]: number } = {}

    // Analyze workload distribution
    sessions.forEach((session) => {
      const date = session.date
      workloadDistribution[date] = (workloadDistribution[date] || 0) + session.duration / 60
    })

    // Generate recommendations
    if (averageConfidence < 0.6) {
      recommendations.push("Consider adjusting your schedule - some sessions are scheduled very close to deadlines")
    }

    const maxDailyHours = Math.max(...Object.values(workloadDistribution))
    if (maxDailyHours > 6) {
      recommendations.push("Some days have heavy study loads - consider redistributing tasks")
    }

    const highPrioritySessions = sessions.filter((s) => s.priority === "high")
    if (highPrioritySessions.length > sessions.length * 0.6) {
      recommendations.push("Many high-priority items detected - focus on completing these first")
    }

    if (sessions.length === 0) {
      recommendations.push("No study sessions could be scheduled - try adjusting your calendar or task deadlines")
    }

    return {
      totalHours,
      averageConfidence,
      recommendations,
      workloadDistribution,
    }
  }
}

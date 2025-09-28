"use client"

import React, { createContext, useContext, useState } from 'react'

export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  type: 'assignment' | 'study' | 'personal' | 'ai-suggested' | 'work'
  course?: string
  description?: string
  calendarName?: string
  calendarId?: string
}

type CalendarContextType = {
  events: CalendarEvent[]
  setEvents: (events: CalendarEvent[]) => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  return <CalendarContext.Provider value={{ events, setEvents }}>{children}</CalendarContext.Provider>
}

export function useCalendar() {
  const ctx = useContext(CalendarContext)
  if (!ctx) throw new Error('useCalendar must be used within CalendarProvider')
  return ctx
}

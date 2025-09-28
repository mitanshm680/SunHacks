"use client"

import React, { useEffect, useState } from 'react'
import { useCalendar } from '@/lib/calendar-context'

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
const SCOPES = 'https://www.googleapis.com/auth/calendar'

declare global {
  interface Window {
    gapi: any
    google: any
  }
}

type Props = {
  onConnected?: () => void
}

export default function GoogleCalendarConnect({ onConnected }: Props) {
  // Use embedded credentials for user convenience
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '551738567665-aqchud9f51f841lf6ld1gp16rp16u454.apps.googleusercontent.com'
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || 'AIzaSyAvaVDwFrhwwi39Yan4itoXnJxq_iufu-s'

  const [gapiInited, setGapiInited] = useState(false)
  const [gisInited, setGisInited] = useState(false)
  const [tokenClient, setTokenClient] = useState<any>(null)
  const [eventsText, setEventsText] = useState<string>('')
  const [signedIn, setSignedIn] = useState(false)
  const { setEvents } = useCalendar()

  useEffect(() => {
    if (!window.gapi) {
      const s = document.createElement('script')
      s.src = 'https://apis.google.com/js/api.js'
      s.async = true
      s.defer = true
      s.onload = () => {
        window.gapi.load('client', async () => {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
          })
          setGapiInited(true)
        })
      }
      document.head.appendChild(s)
    } else {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        })
        setGapiInited(true)
      })
    }

    if (!window.google) {
      const s2 = document.createElement('script')
      s2.src = 'https://accounts.google.com/gsi/client'
      s2.async = true
      s2.defer = true
      s2.onload = () => setGisInited(true)
      document.head.appendChild(s2)
    } else {
      setGisInited(true)
    }
  }, [API_KEY])

  useEffect(() => {
    if (!gapiInited || !gisInited) return
    if (!CLIENT_ID) {
      console.error('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID')
      return
    }
    const tc = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp: any) => {
        if (resp.error) {
          console.error('TokenClient error', resp)
          setEventsText('Error: ' + resp.error)
          return
        }
        setSignedIn(true)
        listUpcomingEvents()
        if (onConnected) onConnected()
      },
    })
    setTokenClient(tc)
  }, [gapiInited, gisInited, CLIENT_ID, onConnected])

  async function listUpcomingEvents() {
    try {
      // First, get list of all calendars
      const calendarsResponse = await window.gapi.client.calendar.calendarList.list()
      const allCalendars = calendarsResponse.result.items || []
      
      // Filter out shared calendars - only include calendars you own or have write access to
      const personalCalendars = allCalendars.filter((cal: any) => {
        // Include primary calendar and calendars you own or have write access to
        return cal.id === 'primary' || 
               cal.accessRole === 'owner' || 
               cal.accessRole === 'writer'
      })
      
      console.log('Personal calendars:', personalCalendars.map((cal: any) => ({ id: cal.id, summary: cal.summary, accessRole: cal.accessRole })))
      console.log('Excluded shared calendars:', allCalendars.filter((cal: any) => cal.accessRole === 'reader').map((cal: any) => ({ id: cal.id, summary: cal.summary })))
      
      // Fetch events from personal calendars only
      const allEvents: any[] = []
      
      for (const calendar of personalCalendars) {
        try {
          const request = {
            calendarId: calendar.id,
            timeMin: new Date().toISOString(),
            showDeleted: false,
            singleEvents: true,
            maxResults: 20, // Increased from 10
            orderBy: 'startTime',
          }
          
          const response = await window.gapi.client.calendar.events.list(request)
          const events = response.result.items || []
          
          // Add calendar info to each event
          const eventsWithCalendar = events.map((ev: any) => ({
            ...ev,
            calendarId: calendar.id,
            calendarSummary: calendar.summary,
            calendarAccessRole: calendar.accessRole,
            calendarColor: calendar.backgroundColor || calendar.colorId,
          }))
          
          allEvents.push(...eventsWithCalendar)
        } catch (calendarError) {
          console.warn(`Failed to fetch events from calendar ${calendar.summary}:`, calendarError)
          // Continue with other calendars even if one fails
        }
      }
      
      if (allEvents.length === 0) {
        setEventsText('No events found across all calendars.')
        return
      }
      
      // Sort all events by start time
      allEvents.sort((a, b) => {
        const dateA = new Date(a.start?.dateTime || a.start?.date)
        const dateB = new Date(b.start?.dateTime || b.start?.date)
        return dateA.getTime() - dateB.getTime()
      })
      
      // Take the first 50 events (increased from 10)
      const limitedEvents = allEvents.slice(0, 50)
      
      // Map Google events to our CalendarEvent shape
      const mapped = limitedEvents.map((ev: any) => {
        // Determine event type based on calendar info (no shared calendars now)
        let eventType = 'personal'
        if (ev.calendarSummary?.toLowerCase().includes('work') || 
            ev.calendarSummary?.toLowerCase().includes('business')) {
          eventType = 'work'
        } else if (ev.calendarSummary?.toLowerCase().includes('study') || 
                   ev.calendarSummary?.toLowerCase().includes('school') ||
                   ev.calendarSummary?.toLowerCase().includes('class')) {
          eventType = 'study'
        }
        
        return {
          id: `${ev.calendarId}-${ev.id}`, // Make ID unique across calendars
          title: ev.summary || 'Untitled',
          start: new Date(ev.start?.dateTime || ev.start?.date),
          end: new Date(ev.end?.dateTime || ev.end?.date),
          type: eventType as any,
          description: ev.description,
          calendarName: ev.calendarSummary,
          calendarId: ev.calendarId,
        }
      })
      
      setEvents(mapped)
      const output = mapped.reduce((str: string, ev: any) => 
        `${str}${ev.title} (${ev.calendarName}) - ${ev.start.toString()}\n`, 
        `Events from ${personalCalendars.length} personal calendars:\n`
      )
      setEventsText(output)
    } catch (err: any) {
      console.error(err)
      setEventsText('Error listing events: ' + err.message)
    }
  }

  function handleConnect() {
    if (!tokenClient) {
      console.warn('Token client not ready')
      return
    }
    const existing = window.gapi.client.getToken()
    if (!existing) {
      tokenClient.requestAccessToken({ prompt: 'consent' })
    } else {
      tokenClient.requestAccessToken({ prompt: '' })
    }
  }

  function handleSignOut() {
    const token = window.gapi.client.getToken()
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token)
      window.gapi.client.setToken('')
      setSignedIn(false)
      setEventsText('')
    }
  }

  return (
    <div>
      <div>
        <button onClick={handleConnect} disabled={!tokenClient} className="bg-primary text-white px-4 py-2 rounded">
          {signedIn ? 'Refresh' : 'Connect Google Calendar'}
        </button>
        <button onClick={handleSignOut} style={{ marginLeft: 8 }} className="ml-2 px-3 py-2 border rounded">
          Sign out
        </button>
      </div>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{eventsText}</pre>
    </div>
  )
}

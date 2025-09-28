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
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY

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
      const request = {
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime',
      }
      const response = await window.gapi.client.calendar.events.list(request)
      const events = response.result.items || []
      if (!events || events.length === 0) {
        setEventsText('No events found.')
        return
      }
      // Map Google events to our CalendarEvent shape
      const mapped = events.map((ev: any) => ({
        id: ev.id,
        title: ev.summary || 'Untitled',
        start: new Date(ev.start?.dateTime || ev.start?.date),
        end: new Date(ev.end?.dateTime || ev.end?.date),
        type: 'personal' as const,
        description: ev.description,
      }))
      setEvents(mapped)
      const output = mapped.reduce((str: string, ev: any) => `${str}${ev.title} (${ev.start.toString()})\n`, 'Events:\n')
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

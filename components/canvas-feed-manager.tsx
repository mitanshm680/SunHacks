"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCalendar } from '@/lib/calendar-context'

type Props = {
  onSaved?: (url: string) => void
  onImported?: () => void
}

export function CanvasFeedManager({ onSaved, onImported }: Props) {
  const [url, setUrl] = useState<string>('')
  const [savedUrl, setSavedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { events, setEvents } = useCalendar()

  useEffect(() => {
    fetch('/api/canvas-feed')
      .then((r) => r.json())
      .then((j) => {
        if (j && j.url) setSavedUrl(j.url)
      })
      .catch(() => {})
  }, [])

  async function save() {
    setLoading(true)
    try {
      const res = await fetch('/api/canvas-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const j = await res.json()
      if (res.ok) {
        setSavedUrl(j.url)
        setUrl('')
        if (onSaved) onSaved(j.url)
      } else {
        console.error(j)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function importNow(u?: string) {
    const target = u || savedUrl
    if (!target) return
    try {
      const res = await fetch(`/api/canvas-ics?url=${encodeURIComponent(target)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      const mapped = data.map((ev: any) => ({
        id: ev.id,
        title: ev.title,
        start: new Date(ev.start),
        end: new Date(ev.end),
        type: 'personal' as const,
        description: ev.description,
      }))
      setEvents([...events, ...mapped])
      if (onImported) onImported()
    } catch (err) {
      console.error('Import failed', err)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input placeholder="Paste Canvas iCal URL" value={url} onChange={(e) => setUrl((e.target as HTMLInputElement).value)} />
      <Button size="sm" onClick={save} disabled={loading || !url}>
        Save
      </Button>
      <Button size="sm" onClick={() => importNow()} disabled={!savedUrl}>
        Import Saved
      </Button>
      {savedUrl && (
        <Button size="sm" variant="ghost" onClick={() => importNow(savedUrl)}>
          Import Current
        </Button>
      )}
    </div>
  )
}

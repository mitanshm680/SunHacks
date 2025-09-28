import { NextResponse } from 'next/server'

function parseICSTime(val: string) {
  // Handles YYYYMMDD and YYYYMMDDTHHMMSSZ or without Z
  if (/^\d{8}$/.test(val)) {
    const y = val.slice(0, 4)
    const m = val.slice(4, 6)
    const d = val.slice(6, 8)
    return new Date(`${y}-${m}-${d}`)
  }
  const m = val.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)/)
  if (m) {
    const [, y, mo, d, hh, mm, ss, z] = m
    // build ISO string
    const iso = `${y}-${mo}-${d}T${hh}:${mm}:${ss}${z ? 'Z' : ''}`
    return new Date(iso)
  }
  // fallback
  return new Date(val)
}

function parseICS(ics: string) {
  const events: any[] = []
  const blocks = ics.split(/BEGIN:VEVENT\r?\n/).slice(1)
  for (const b of blocks) {
    const body = b.split(/\r?\nEND:VEVENT/)[0]
    const lines = body.split(/\r?\n/)
    const obj: any = {}
    for (let line of lines) {
      if (!line) continue
      // handle folded lines (continuation starting with space)
      if (line.startsWith(' ')) continue
      const idx = line.indexOf(':')
      if (idx === -1) continue
      const key = line.slice(0, idx)
      const val = line.slice(idx + 1)
      if (key.startsWith('DTSTART')) obj.startRaw = val
      else if (key.startsWith('DTEND')) obj.endRaw = val
      else if (key === 'SUMMARY') obj.summary = val
      else if (key === 'DESCRIPTION') obj.description = val
      else if (key === 'UID') obj.uid = val
    }
    if (obj.startRaw) obj.start = parseICSTime(obj.startRaw)
    if (obj.endRaw) obj.end = parseICSTime(obj.endRaw)
    events.push(obj)
  }
  return events
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const urlParam = searchParams.get('url')
  // priority: query param -> env var
  const url = urlParam || process.env.CANVAS_ICS_URL
  if (!url) return NextResponse.json({ error: 'CANVAS_ICS_URL not configured' }, { status: 400 })
  try {
    const res = await fetch(url)
    if (!res.ok) return NextResponse.json({ error: 'Failed to fetch ICS' }, { status: 502 })
    const text = await res.text()
    const parsed = parseICS(text)
    const mapped = parsed.map((ev: any) => ({
      id: ev.uid || `${ev.summary}-${ev.start?.toString()}`,
      title: ev.summary || 'Untitled',
      start: ev.start ? ev.start.toISOString() : null,
      end: ev.end ? ev.end.toISOString() : null,
      description: ev.description,
      type: 'personal',
    }))
    return NextResponse.json(mapped)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.resolve(process.cwd(), 'data')
const FILE_PATH = path.join(DATA_DIR, 'canvas-feeds.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, JSON.stringify({ url: null }, null, 2))
}

export async function GET() {
  try {
    ensureDataDir()
    const raw = fs.readFileSync(FILE_PATH, 'utf-8')
    const json = JSON.parse(raw)
    return NextResponse.json(json)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    ensureDataDir()
    const body = await request.json()
    const { url } = body
    if (!url || typeof url !== 'string') return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
    const json = { url }
    fs.writeFileSync(FILE_PATH, JSON.stringify(json, null, 2))
    return NextResponse.json(json)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

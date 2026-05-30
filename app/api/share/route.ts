import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const SHARE_TTL = 60 * 60 * 24 * 7

const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
  : null

function genId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(req: NextRequest) {
  if (!redis) return NextResponse.json({ error: 'Storage unavailable' }, { status: 503 })

  let body: { analysis: unknown; docName?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  if (!body.analysis || typeof body.analysis !== 'object') {
    return NextResponse.json({ error: 'Missing analysis' }, { status: 400 })
  }

  const id = genId()
  await redis.set(
    `share:${id}`,
    JSON.stringify({ analysis: body.analysis, docName: body.docName ?? null }),
    { ex: SHARE_TTL }
  )

  return NextResponse.json({ id })
}

export async function GET(req: NextRequest) {
  if (!redis) return NextResponse.json({ error: 'Storage unavailable' }, { status: 503 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id || !/^[a-f0-9]{12}$/.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const raw = await redis.get<unknown>(`share:${id}`)
  if (!raw) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = typeof raw === 'string' ? JSON.parse(raw) : raw
  return NextResponse.json(data)
}

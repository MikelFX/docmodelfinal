import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Redis } from '@upstash/redis'

const DEFAULT_CREDITS = 10

// Support both Vercel KV env var names and Upstash direct env var names
const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const redis = REST_URL && REST_TOKEN
  ? new Redis({ url: REST_URL, token: REST_TOKEN })
  : null

async function kvGet(key: string): Promise<number | null> {
  if (!redis) return null
  try { return await redis.get<number>(key) } catch { return null }
}

async function kvSet(key: string, value: number): Promise<void> {
  if (!redis) return
  try { await redis.set(key, value) } catch { /* silent */ }
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const credits = await kvGet(`credits:${userId}`)

  if (credits === null) {
    await kvSet(`credits:${userId}`, DEFAULT_CREDITS)
    return NextResponse.json({ credits: DEFAULT_CREDITS })
  }

  return NextResponse.json({ credits })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { action, amount } = await req.json()

  if (action === 'add') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (action === 'spend') {
    if (!redis) {
      return NextResponse.json({ ok: true })
    }
    const current = (await kvGet(`credits:${userId}`)) ?? DEFAULT_CREDITS
    if (current < amount) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
    }
    const newVal = current - amount
    await kvSet(`credits:${userId}`, newVal)
    return NextResponse.json({ credits: newVal })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function addCredits(userId: string, amount: number): Promise<number> {
  const current = (await kvGet(`credits:${userId}`)) ?? DEFAULT_CREDITS
  const newVal = current + amount
  await kvSet(`credits:${userId}`, newVal)
  return newVal
}

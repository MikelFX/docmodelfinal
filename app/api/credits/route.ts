import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { kv } from '@vercel/kv'

const DEFAULT_CREDITS = 10

const KV_AVAILABLE = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

async function kvGet(key: string): Promise<number | null> {
  if (!KV_AVAILABLE) return null
  try { return await kv.get<number>(key) } catch { return null }
}

async function kvSet(key: string, value: number): Promise<void> {
  if (!KV_AVAILABLE) return
  try { await kv.set(key, value) } catch { /* silent */ }
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

  const current = (await kvGet(`credits:${userId}`)) ?? DEFAULT_CREDITS

  if (action === 'spend') {
    if (!KV_AVAILABLE) {
      // KV not configured — client already has the correct local value, don't override it
      return NextResponse.json({ ok: true })
    }
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

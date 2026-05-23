import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Redis } from '@upstash/redis'
import { kvGet, kvSet } from '@/lib/credits'

const DEFAULT_CREDITS = 10
const MAX_SPEND = 25
const REFUND_WINDOW_MS = 5 * 60 * 1000

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const redis = REST_URL && REST_TOKEN
  ? new Redis({ url: REST_URL, token: REST_TOKEN })
  : null

function validateAmount(amount: unknown): number | null {
  const n = Number(amount)
  if (!Number.isInteger(n) || n <= 0 || n > MAX_SPEND) return null
  return n
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

  let body: { action?: string; amount?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const { action, amount } = body

  if (action === 'spend') {
    const amt = validateAmount(amount)
    if (amt === null) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!redis) return NextResponse.json({ ok: true })

    const current = (await kvGet(`credits:${userId}`)) ?? DEFAULT_CREDITS
    if (current < amt) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
    }
    const newVal = current - amt
    await kvSet(`credits:${userId}`, newVal)

    try {
      await redis.set(`lastspend:${userId}`, `${amt}:${Date.now()}`, { ex: Math.ceil(REFUND_WINDOW_MS / 1000) })
    } catch { /* non-critical */ }

    return NextResponse.json({ credits: newVal })
  }

  if (action === 'refund') {
    const amt = validateAmount(amount)
    if (amt === null) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!redis) return NextResponse.json({ ok: true })

    let lastSpend: string | null = null
    try { lastSpend = await redis.get<string>(`lastspend:${userId}`) } catch { /* ignore */ }

    if (!lastSpend) {
      return NextResponse.json({ error: 'No recent spend to refund' }, { status: 400 })
    }

    const [spentAmtStr, tsStr] = lastSpend.split(':')
    const spentAmt = parseInt(spentAmtStr, 10)
    const age = Date.now() - parseInt(tsStr, 10)

    if (age > REFUND_WINDOW_MS) {
      return NextResponse.json({ error: 'Refund window expired' }, { status: 400 })
    }
    if (spentAmt !== amt) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    const current = (await kvGet(`credits:${userId}`)) ?? DEFAULT_CREDITS
    const newVal = current + amt
    await kvSet(`credits:${userId}`, newVal)

    try { await redis.del(`lastspend:${userId}`) } catch { /* ignore */ }

    return NextResponse.json({ credits: newVal })
  }

  if (action === 'add') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

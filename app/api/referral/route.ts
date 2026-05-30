import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { addCredits } from '@/lib/credits'
import { Redis } from '@upstash/redis'

const REFERRAL_BONUS = 2

const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
  : null

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  let body: { refCode?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const { refCode } = body
  if (!refCode || typeof refCode !== 'string' || !/^[a-zA-Z0-9_-]{6,32}$/.test(refCode)) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
  }

  // Referral code = userId with 'user_' stripped
  const referrerId = `user_${refCode}`

  if (referrerId === userId) {
    return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 })
  }

  if (!redis) return NextResponse.json({ ok: false, error: 'Storage unavailable' }, { status: 503 })

  // Each new user can only use one referral
  const alreadyUsed = await redis.get(`referral:used:${userId}`)
  if (alreadyUsed) {
    return NextResponse.json({ ok: false, error: 'Already used a referral' })
  }

  await redis.set(`referral:used:${userId}`, referrerId, { ex: 60 * 60 * 24 * 365 })
  await addCredits(referrerId, REFERRAL_BONUS)
  const newCredits = await addCredits(userId, REFERRAL_BONUS)
  await redis.incr(`referral:count:${referrerId}`)

  return NextResponse.json({ ok: true, credits: newCredits })
}

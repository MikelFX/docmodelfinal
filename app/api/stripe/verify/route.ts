import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { addCredits } from '@/app/api/credits/route'
import { Redis } from '@upstash/redis'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const redis = REST_URL && REST_TOKEN ? new Redis({ url: REST_URL, token: REST_TOKEN }) : null

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { sessionId } = await req.json()
  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (err: any) {
    console.error('[verify] Stripe error:', err.message)
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
  }

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Not paid yet' }, { status: 402 })
  }

  const metaUserId = session.metadata?.userId
  const credits = parseInt(session.metadata?.credits || '0', 10)

  if (metaUserId !== userId) {
    return NextResponse.json({ error: 'Session does not belong to this user' }, { status: 403 })
  }

  if (!credits) {
    return NextResponse.json({ error: 'No credits in session metadata' }, { status: 400 })
  }

  // Idempotency: skip if this session was already processed by the webhook
  const idempotencyKey = `processed:${sessionId}`
  if (redis) {
    const alreadyDone = await redis.get(idempotencyKey)
    if (alreadyDone) {
      const current = await redis.get<number>(`credits:${userId}`) ?? 0
      return NextResponse.json({ credits: current, alreadyProcessed: true })
    }
    // Mark as processed before adding credits (prevents race with webhook)
    await redis.set(idempotencyKey, '1', { ex: 60 * 60 * 24 * 30 }) // 30 days TTL
  }

  const newTotal = await addCredits(userId, credits)
  console.log(`[verify] +${credits} credits for ${userId} via session ${sessionId} → total ${newTotal}`)

  return NextResponse.json({ credits: newTotal })
}

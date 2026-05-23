import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { addCredits } from '@/lib/credits'
import { Redis } from '@upstash/redis'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const redis = REST_URL && REST_TOKEN ? new Redis({ url: REST_URL, token: REST_TOKEN }) : null

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('[webhook] Invalid signature:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const credits = parseInt(session.metadata?.credits || '0', 10)

    if (!userId || !credits) {
      console.error('[webhook] Missing metadata:', session.metadata)
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    // Idempotency: skip if already processed by the verify endpoint
    const idempotencyKey = `processed:${session.id}`
    if (redis) {
      const alreadyDone = await redis.get(idempotencyKey)
      if (alreadyDone) {
        console.log(`[webhook] Session ${session.id} already processed, skipping`)
        return NextResponse.json({ received: true })
      }
      await redis.set(idempotencyKey, '1', { ex: 60 * 60 * 24 * 30 })
    }

    try {
      const newTotal = await addCredits(userId, credits)
      console.log(`[webhook] +${credits} credits for ${userId} → total ${newTotal}`)
    } catch (err: any) {
      console.error('[webhook] KV error:', err.message)
      return NextResponse.json({ error: 'KV error' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

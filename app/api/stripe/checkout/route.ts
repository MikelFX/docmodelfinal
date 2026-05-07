import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PLANS: Record<string, { priceId: string; credits: number }> = {
  starter: { priceId: process.env.STRIPE_PRICE_STARTER!, credits: 10 },
  pro:     { priceId: process.env.STRIPE_PRICE_PRO!,     credits: 40  },
  team:    { priceId: process.env.STRIPE_PRICE_TEAM!,    credits: 120 },
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })

  const { plan } = await req.json()
  const selected = PLANS[plan]
  if (!selected) return NextResponse.json({ error: 'Neplatný plán.' }, { status: 400 })

  const origin = req.headers.get('origin') || 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: selected.priceId, quantity: 1 }],
      success_url: `${origin}/koupit/success?credits=${selected.credits}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/koupit`,
      metadata: { userId, credits: selected.credits.toString(), plan },
    })
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[Stripe]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

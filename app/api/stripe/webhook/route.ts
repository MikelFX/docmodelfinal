import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { addCredits } from '@/app/api/credits/route'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Chybí webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('[Stripe webhook] Neplatný podpis:', err.message)
    return NextResponse.json({ error: 'Neplatný podpis' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const credits = parseInt(session.metadata?.credits || '0', 10)

    if (!userId || !credits) {
      console.error('[Stripe webhook] Chybí metadata:', session.metadata)
      return NextResponse.json({ error: 'Chybí metadata' }, { status: 400 })
    }

    try {
      const newTotal = await addCredits(userId, credits)
      console.log(`[Stripe webhook] +${credits} kreditů pro ${userId} → celkem ${newTotal}`)
    } catch (err: any) {
      console.error('[Stripe webhook] KV chyba:', err.message)
      return NextResponse.json({ error: 'KV chyba' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

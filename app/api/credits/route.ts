import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Jednoduchý in-memory store — nahradit databází (Vercel KV, Supabase...)
const userCredits: Record<string, number> = {}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })

  const credits = userCredits[userId] ?? 5 // 5 kreditů zdarma při registraci
  return NextResponse.json({ credits })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })

  const { action, amount } = await req.json()

  if (action === 'add') {
    userCredits[userId] = (userCredits[userId] ?? 5) + amount
  } else if (action === 'spend') {
    const current = userCredits[userId] ?? 5
    if (current < amount) return NextResponse.json({ error: 'Nedostatek kreditů' }, { status: 400 })
    userCredits[userId] = current - amount
  }

  return NextResponse.json({ credits: userCredits[userId] })
}

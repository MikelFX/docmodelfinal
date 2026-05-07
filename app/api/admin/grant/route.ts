import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { addCredits } from '@/app/api/credits/route'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_SECRET = process.env.ADMIN_SECRET

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { amount } = await req.json()
  if (!amount || amount <= 0 || amount > 500) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const newTotal = await addCredits(userId, amount)
  console.log(`[admin/grant] +${amount} credits for ${userId} → total ${newTotal}`)
  return NextResponse.json({ ok: true, credits: newTotal })
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { kv } from '@vercel/kv'

const DEFAULT_CREDITS = 5

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })

  const credits = await kv.get<number>(`credits:${userId}`)

  // První přihlášení — nastav výchozí kredity
  if (credits === null) {
    await kv.set(`credits:${userId}`, DEFAULT_CREDITS)
    return NextResponse.json({ credits: DEFAULT_CREDITS })
  }

  return NextResponse.json({ credits })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })

  const { action, amount } = await req.json()

  const current = await kv.get<number>(`credits:${userId}`) ?? DEFAULT_CREDITS

  if (action === 'add') {
    const newVal = current + amount
    await kv.set(`credits:${userId}`, newVal)
    return NextResponse.json({ credits: newVal })
  }

  if (action === 'spend') {
    if (current < amount) {
      return NextResponse.json({ error: 'Nedostatek kreditů' }, { status: 400 })
    }
    const newVal = current - amount
    await kv.set(`credits:${userId}`, newVal)
    return NextResponse.json({ credits: newVal })
  }

  return NextResponse.json({ error: 'Neznámá akce' }, { status: 400 })
}

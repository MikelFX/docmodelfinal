import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
  : null

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret') ?? req.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!redis) return NextResponse.json({ error: 'No Redis' }, { status: 503 })

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - i * 86400000)
    return d.toISOString().slice(0, 10)
  })

  const [total, activeToday, ...dayCounts] = await Promise.all([
    redis.get<number>('stats:analyses:total'),
    redis.scard(`stats:users:active:${days[0]}`),
    ...days.map(d => redis.get<number>(`stats:analyses:date:${d}`)),
  ])

  return NextResponse.json({
    total: total ?? 0,
    today: (dayCounts[0] as number) ?? 0,
    yesterday: (dayCounts[1] as number) ?? 0,
    activeUsersToday: activeToday ?? 0,
    chart: days.map((date, i) => ({ date, count: (dayCounts[i] as number) ?? 0 })),
  })
}

import { Redis } from '@upstash/redis'

const DEFAULT_CREDITS = 10
const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const redis = REST_URL && REST_TOKEN
  ? new Redis({ url: REST_URL, token: REST_TOKEN })
  : null

export async function kvGet(key: string): Promise<number | null> {
  if (!redis) return null
  try { return await redis.get<number>(key) } catch { return null }
}

export async function kvSet(key: string, value: number): Promise<void> {
  if (!redis) return
  try { await redis.set(key, value) } catch { /* silent */ }
}

export async function addCredits(userId: string, amount: number): Promise<number> {
  const current = (await kvGet(`credits:${userId}`)) ?? DEFAULT_CREDITS
  const newVal = current + amount
  await kvSet(`credits:${userId}`, newVal)
  return newVal
}

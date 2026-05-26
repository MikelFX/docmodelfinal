import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { anthropic, MODEL } from '@/lib/anthropic'
import { Redis } from '@upstash/redis'

export const maxDuration = 60

const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
  : null

const DEFAULT_CREDITS = 10
const ANALYZE_COST = 1
const FREE_LIMIT = 3
const RATE_WINDOW_SEC = 60 * 60 // 1 hour
const RATE_LIMIT_ANON = 3       // max 3 per hour per IP (matches free tier)
const RATE_LIMIT_AUTH = 60      // max 60 per hour per user

// Atomic credit deduction using Redis to prevent race conditions
async function trySpendCredit(userId: string): Promise<{ ok: boolean; credits: number }> {
  if (!redis) return { ok: true, credits: DEFAULT_CREDITS }
  const key = `credits:${userId}`
  // Use pipeline for atomic check-and-decrement
  const current = (await redis.get<number>(key)) ?? DEFAULT_CREDITS
  if (current < ANALYZE_COST) return { ok: false, credits: current }
  const newVal = current - ANALYZE_COST
  await redis.set(key, newVal)
  return { ok: true, credits: newVal }
}

async function checkRateLimit(identifier: string, limit: number): Promise<boolean> {
  if (!redis) return true
  const key = `rl:docguard:${identifier}`
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, RATE_WINDOW_SEC)
  return count <= limit
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

function validateContent(content: unknown): string | null {
  if (typeof content !== 'string') return null
  const trimmed = content.trim()
  if (trimmed.length === 0 || trimmed.length > 50000) return null
  return trimmed
}

function validateBase64(b64: unknown): boolean {
  if (typeof b64 !== 'string') return false
  // base64 chars only, reasonable size (max ~7MB decoded ≈ ~9.5MB base64)
  if (b64.length > 10_000_000) return false
  return /^[A-Za-z0-9+/]+=*$/.test(b64.slice(0, 100))
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const SYSTEM_ANALYZE = `Jsi DocThink — AI asistent specializovaný na analýzu smluv a právních dokumentů. Tvůj cíl: chránit uživatele tím, že přesně identifikuješ skutečná rizika.

ZÁSADNÍ PRAVIDLA:
- Analyzuj POUZE to, co je v dokumentu skutečně napsáno. Nikdy nevymýšlej rizika ani problémy, které tam nejsou.
- Pokud dokument není smlouva (jde o fakturu, email, formulář, prázdný obrázek apod.), v "summary" to jasně napiš a použij verdict "modify".
- Soustřeď se na zájmy UŽIVATELE — osoby, která dokument dostala k podpisu nebo přijetí.
- Piš srozumitelně pro běžného člověka bez právního vzdělání.

KRITÉRIA PRO VERDIKT:
- "sign" + "green": Standardní, vyvážená smlouva. Podmínky jsou obvyklé pro daný typ dokumentu. Žádné závažné problémy.
- "modify" + "yellow": Smlouva má nevýhodné nebo neobvyklé podmínky, které by měly být upraveny. Nebo dokument je nekompletní.
- "reject" + "red": Smlouva obsahuje zneužívající, extrémně jednostranné nebo potenciálně protiprávní podmínky. Nebo jde o evidentní podvodný dokument.

KRITÉRIA PRO ÚROVEŇ RIZIKA:
- "red": Přímé finanční riziko, neomezené ručení, automatické prodlužování bez výpovědní možnosti, nepřiměřené sankce, podmínky zbavující uživatele základních práv, zakázané klauzule.
- "yellow": Podmínky mírně ve prospěch druhé strany, neobvyklé ale ne nebezpečné formulace, chybějící standardní ochranná ustanovení.

POČET RIZIK: Uváděj pouze reálná rizika. Raději 2 přesné než 6 pochybných. Maximum 6 rizik celkem.
CHYBĚJÍCÍ POLOŽKY: Pouze skutečně důležité věci pro daný typ dokumentu. Max 4 položky. Pokud nechybí nic zásadního, vrať [].
JAZYK: Piš summary, rizika, doporučení ve stejném jazyce jako analyzovaný dokument.

FORMÁT — vrať POUZE tento JSON, bez jakéhokoliv textu před ani po něm, bez markdown bloků (bez \`\`\`):
{
  "verdict": "sign" | "modify" | "reject",
  "verdictCZ": "Lze podepsat" | "Doporučuji upravit" | "Nedoporučuji podepsat",
  "verdictColor": "green" | "yellow" | "red",
  "summary": "2-3 věty: typ dokumentu, strany, hlavní předmět",
  "risks": [
    { "level": "red" | "yellow", "title": "Stručný název rizika", "description": "Konkrétní praktický dopad na uživatele" }
  ],
  "missing": ["Důležitá chybějící věc"],
  "recommendation": "Co přesně udělat. Max 2 věty."
}`

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }

  // Auth check
  let userId: string | null = null
  try {
    const session = await auth()
    userId = session.userId ?? null
  } catch { /* unauthenticated */ }

  // Rate limiting
  const rateLimitId = userId ?? `ip:${getClientIp(req)}`
  const rateLimit = userId ? RATE_LIMIT_AUTH : RATE_LIMIT_ANON
  const allowed = await checkRateLimit(rateLimitId, rateLimit)
  if (!allowed) {
    return NextResponse.json({ error: 'Příliš mnoho požadavků. Zkuste to za hodinu.' }, { status: 429 })
  }

  // Parse and validate body
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { content, imageBase64, imageType, chatHistory, userMessage, pages } = body

  // ── CHAT MODE ──────────────────────────────────────────────────────────────
  if (userMessage !== undefined) {
    // Chat requires auth
    if (!userId) {
      return NextResponse.json({ error: 'Pro chat se přihlas.' }, { status: 401 })
    }
    if (typeof userMessage !== 'string' || userMessage.trim().length === 0 || userMessage.length > 2000) {
      return NextResponse.json({ error: 'Invalid message.' }, { status: 400 })
    }
    if (!content && !imageBase64) {
      return NextResponse.json({ error: 'Missing document.' }, { status: 400 })
    }

    const docContext = typeof content === 'string'
      ? `DOKUMENT:\n${content.slice(0, 6000)}`
      : '[Dokument byl nahrán jako obrázek]'

    const systemPrompt = `Jsi DocThink — AI asistent pro smlouvy. Uživatel se ptá na dokument, který byl právě analyzován.

PRAVIDLA:
- Odpovídej stručně a věcně — 2-4 věty pokud není nutné více.
- Vycházej POUZE z obsahu dokumentu. Nevymýšlej informace, které tam nejsou.
- Pokud se otázka netýká dokumentu nebo jde o obecnou právní radu, odpověz: "To přesahuje rozsah tohoto dokumentu — pro takovou otázku doporučuji konzultaci s advokátem."
- Nikdy nepředstírej, že jsi právník. Při závažných situacích vždy doporuč odborníka.
- Žádný markdown. Pouze čistý text.
- Odpovídej v jazyce uživatelovy otázky.`

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []

    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      const safeHistory = chatHistory
        .slice(-10)
        .filter(m => m && typeof m.role === 'string' && typeof m.content === 'string')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: String(m.content).slice(0, 4000) }))

      messages.push({ role: 'user', content: `Kontext dokumentu:\n${docContext}` })
      messages.push({ role: 'assistant', content: 'Rozumím, jsem připraven odpovídat na otázky o tomto dokumentu.' })
      messages.push(...safeHistory)
    } else {
      messages.push({ role: 'user', content: `${docContext}\n\n---\n\n${userMessage.trim()}` })
    }

    if (messages[messages.length - 1]?.role !== 'user' || messages.length > 2) {
      messages.push({ role: 'user', content: userMessage.trim() })
    }

    try {
      const stream = await anthropic.messages.stream({
        model: MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        messages,
      })

      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                controller.enqueue(encoder.encode(chunk.delta.text))
              }
            }
          } finally {
            controller.close()
          }
        },
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-store',
        },
      })
    } catch (err: any) {
      return NextResponse.json({ error: 'AI server error.' }, { status: 502 })
    }
  }

  // ── ANALYZE MODE ───────────────────────────────────────────────────────────
  const validContent = content !== undefined ? validateContent(content) : null
  const hasImage = imageBase64 !== undefined
  const hasPages = Array.isArray(pages) && pages.length > 0

  if (!validContent && !hasImage && !hasPages) {
    return NextResponse.json({ error: 'Missing content or image.' }, { status: 400 })
  }

  if (hasImage && !hasPages) {
    if (!validateBase64(imageBase64)) {
      return NextResponse.json({ error: 'Invalid image data.' }, { status: 400 })
    }
    if (!ALLOWED_IMAGE_TYPES.includes(String(imageType))) {
      return NextResponse.json({ error: 'Unsupported image type.' }, { status: 400 })
    }
  }

  if (hasPages) {
    const pagesArr = pages as { base64: string; type: string }[]
    if (pagesArr.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 pages allowed.' }, { status: 400 })
    }
    for (const p of pagesArr) {
      if (!validateBase64(p.base64) || !ALLOWED_IMAGE_TYPES.includes(p.type)) {
        return NextResponse.json({ error: 'Invalid image data.' }, { status: 400 })
      }
    }
  }

  // Credit check for signed-in users
  if (userId) {
    const current = redis ? ((await redis.get<number>(`credits:${userId}`)) ?? DEFAULT_CREDITS) : DEFAULT_CREDITS
    if (current < ANALYZE_COST) {
      return NextResponse.json({ error: 'Nedostatek kreditů. Kupte si kredity a pokračujte.' }, { status: 402 })
    }
  }

  try {
    let messageContent: any

    if (hasPages) {
      const pagesArr = pages as { base64: string; type: string }[]
      messageContent = [
        ...pagesArr.map((p, i) => ({
          type: 'image',
          source: {
            type: 'base64',
            media_type: p.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: p.base64,
          },
        })),
        { type: 'text', text: `Analyzuj tento dokument (${pagesArr.length} ${pagesArr.length === 1 ? 'strana' : pagesArr.length < 5 ? 'strany' : 'stran'}). Analyzuj všechny strany dohromady jako jeden celek. Identifikuj pouze skutečná rizika, která jsou v dokumentu přímo přítomna. Vrať výsledek jako JSON přesně podle zadané struktury.` },
      ]
    } else if (hasImage) {
      messageContent = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: String(imageType) as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: String(imageBase64),
          },
        },
        { type: 'text', text: 'Analyzuj tento dokument na obrázku. Identifikuj pouze rizika, která jsou v dokumentu skutečně přítomna. Vrať výsledek jako JSON přesně podle zadané struktury.' },
      ]
    } else {
      messageContent = `Analyzuj tento dokument. Identifikuj pouze rizika, která jsou v dokumentu skutečně přítomna — nevymýšlej problémy, které tam nejsou. Vrať výsledek jako JSON přesně podle zadané struktury.\n\nDOKUMENT:\n${validContent!.slice(0, 8000)}`
    }

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_ANALYZE,
      messages: [{ role: 'user', content: messageContent }],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI returned invalid response.' }, { status: 502 })
    }

    const analysis = JSON.parse(jsonMatch[0])

    // Deduct credit AFTER successful analysis
    let remainingCredits: number | null = null
    if (userId) {
      const spent = await trySpendCredit(userId)
      remainingCredits = spent.credits
    }

    return NextResponse.json({ ...analysis, _credits: remainingCredits })
  } catch (err: any) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'AI returned invalid response.' }, { status: 502 })
    }
    const status = err.status === 429 ? 429 : 502
    return NextResponse.json({ error: 'Analýza selhala. Zkuste znovu.' }, { status })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { anthropic, MODEL } from '@/lib/anthropic'
import { Redis } from '@upstash/redis'

const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
  : null

const DEFAULT_CREDITS = 10
const ANALYZE_COST = 1

async function spendCredit(userId: string): Promise<{ ok: boolean; credits: number }> {
  if (!redis) return { ok: true, credits: DEFAULT_CREDITS }
  const current = (await redis.get<number>(`credits:${userId}`)) ?? DEFAULT_CREDITS
  if (current < ANALYZE_COST) return { ok: false, credits: current }
  const newVal = current - ANALYZE_COST
  await redis.set(`credits:${userId}`, newVal)
  return { ok: true, credits: newVal }
}

const SYSTEM_ANALYZE = `Jsi DocGuard — AI právní asistent. Analyzuješ smlouvy a dokumenty a chráníš uživatele před rizikovými podmínkami.

Odpovídej VŽDY jako validní JSON objekt s touto strukturou:
{
  "verdict": "sign" | "modify" | "reject",
  "verdictCZ": "Lze podepsat" | "Doporučuji upravit" | "Nedoporučuji podepsat",
  "verdictColor": "green" | "yellow" | "red",
  "summary": "2-3 věty shrnutí dokumentu",
  "risks": [
    { "level": "red" | "yellow", "title": "Název rizika", "description": "Popis co to znamená pro uživatele" }
  ],
  "missing": ["Co v dokumentu chybí a mělo by tam být"],
  "recommendation": "Konkrétní doporučení co udělat - max 2 věty"
}

Buď konkrétní a srozumitelný pro běžného člověka bez právního vzdělání. Nepoužívej složité právní termíny.`

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 })
  }

  let body: {
    content?: string
    imageBase64?: string
    imageType?: string
    chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
    userMessage?: string
    lang?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { content, imageBase64, imageType, chatHistory, userMessage } = body

  // CHAT MODE
  if (userMessage) {
    if (!content && !imageBase64) {
      return NextResponse.json({ error: 'Missing document content for chat.' }, { status: 400 })
    }

    const systemPrompt = `Jsi DocGuard — AI právní asistent. Uživatel s tebou chatuje o smlouvě nebo dokumentu, který jsi právě analyzoval(a). Odpovídej stručně, konkrétně a srozumitelně. Nepoužívej markdown formátování. Pouze čistý text.`

    const docContext = content
      ? `DOKUMENT:\n${content.slice(0, 6000)}`
      : '[Dokument byl nahrán jako obrázek]'

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      { role: 'user', content: `${docContext}\n\n---\n\n${userMessage}` },
    ]

    if (chatHistory && chatHistory.length > 0) {
      // Build proper history: doc context first message, then history, then new message
      const historyMessages = chatHistory.slice(-10) // max 10 history messages
      messages.length = 0
      messages.push({ role: 'user', content: `Kontext dokumentu:\n${docContext}` })
      messages.push({ role: 'assistant', content: 'Rozumím, jsem připraven odpovídat na otázky o tomto dokumentu.' })
      for (const msg of historyMessages) {
        messages.push(msg)
      }
      messages.push({ role: 'user', content: userMessage })
    }

    try {
      const stream = await anthropic.messages.stream({
        model: MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages,
      })

      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              if (
                chunk.type === 'content_block_delta' &&
                chunk.delta.type === 'text_delta'
              ) {
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
          'Transfer-Encoding': 'chunked',
          'Cache-Control': 'no-cache',
        },
      })
    } catch (err: any) {
      console.error('[DocGuard] chat error:', err.message)
      return NextResponse.json({ error: err.message ?? 'AI server error.' }, { status: 502 })
    }
  }

  // ANALYZE MODE
  if (!content && !imageBase64) {
    return NextResponse.json({ error: 'Missing content or image.' }, { status: 400 })
  }

  // Deduct credit for signed-in users
  const { userId } = await auth()
  if (userId) {
    const spend = await spendCredit(userId)
    if (!spend.ok) {
      return NextResponse.json({ error: 'Nedostatek kreditů. Kupte si kredity a pokračujte.' }, { status: 402 })
    }
  }

  try {
    let messageContent: any

    if (imageBase64 && imageType) {
      messageContent = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: imageType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: imageBase64,
          },
        },
        {
          type: 'text',
          text: 'Analyzuj tento dokument/smlouvu na obrázku a vrať výsledek jako JSON podle instrukcí v system promptu.',
        },
      ]
    } else {
      messageContent = `Analyzuj tento dokument/smlouvu a vrať výsledek jako JSON podle instrukcí v system promptu.\n\nDOKUMENT:\n${content!.slice(0, 8000)}`
    }

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_ANALYZE,
      messages: [{ role: 'user', content: messageContent }],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

    // Extract JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI returned invalid response. Please try again.' }, { status: 502 })
    }

    const analysis = JSON.parse(jsonMatch[0])
    return NextResponse.json(analysis)
  } catch (err: any) {
    console.error('[DocGuard] analyze error:', err.message)
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'AI returned invalid JSON. Please try again.' }, { status: 502 })
    }
    const status = err.status === 429 ? 429 : 502
    return NextResponse.json({ error: err.message ?? 'AI server error.' }, { status })
  }
}

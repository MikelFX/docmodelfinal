import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return new Response('Nepřihlášen', { status: 401 })

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return new Response('Chybí OPENROUTER_API_KEY', { status: 500 })

  let messages: { role: string; content: string }[]
  try {
    const body = await req.json()
    messages = body.messages ?? []
  } catch {
    return new Response('Neplatný požadavek', { status: 400 })
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://docthink.vercel.app',
      'X-Title': 'DocThink',
    },
    body: JSON.stringify({
      model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
      stream: true,
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: 'Jsi DocThink AI asistent. Odpovídáš vždy česky, stručně, přátelsky a věcně. Buď konkrétní a praktický. Nikdy nepíš <think> bloky ani vnitřní úvahy — jen čistou odpověď.',
        },
        ...messages,
      ],
    }),
  })

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => 'Chyba AI serveru')
    return new Response(text, { status: 502 })
  }

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  })
}

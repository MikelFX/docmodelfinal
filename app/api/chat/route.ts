import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { anthropic, MODEL } from '@/lib/anthropic'
import { langInstruction } from '@/lib/langNames'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return new Response('Not authenticated', { status: 401 })

  if (!process.env.ANTHROPIC_API_KEY) return new Response('Missing ANTHROPIC_API_KEY', { status: 500 })

  let messages: { role: string; content: string }[]
  let lang = 'en'
  try {
    const body = await req.json()
    messages = body.messages ?? []
    lang = body.lang ?? 'en'
  } catch {
    return new Response('Invalid request', { status: 400 })
  }

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 8192,
    system: `You are DocThink AI assistant. Be concise, friendly, and practical. Never use markdown formatting — no asterisks, no hashtags, no bullet dashes, no bold/italic syntax. Write in plain text only. ${langInstruction(lang)}`,
    messages: messages as { role: 'user' | 'assistant'; content: string }[],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const data = JSON.stringify({ choices: [{ delta: { content: chunk.delta.text } }] })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  })
}

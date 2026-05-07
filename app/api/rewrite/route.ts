import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODEL } from '@/lib/anthropic'
import { langInstruction } from '@/lib/langNames'

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 })

  const { content, style, lang } = await req.json()
  if (!content) return NextResponse.json({ error: 'Missing document content.' }, { status: 400 })

  const stylePrompts: Record<string, string> = {
    formal: 'Rewrite this text in formal, professional language suitable for business communication and official documents. Preserve all information, only change the style and tone.',
    simple: 'Rewrite this text in simple, clear language. Remove complex words and long sentences. Preserve all information.',
  }

  const prompt = stylePrompts[style] || stylePrompts.formal

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: `You are a professional text editor. Rewrite texts according to the requested style. Return only the rewritten text, no commentary. ${langInstruction(lang ?? 'en')}`,
      messages: [{ role: 'user', content: `${prompt}\n\nTEXT:\n${content.slice(0, 4000)}` }],
    })

    const result = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    if (!result) return NextResponse.json({ error: 'AI returned an empty response.' }, { status: 502 })

    return NextResponse.json({ result })
  } catch (err: any) {
    console.error('[DocMind] rewrite error:', err.message)
    const status = err.status === 429 ? 429 : 502
    return NextResponse.json({ error: err.message ?? 'Server error.' }, { status })
  }
}

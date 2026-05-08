import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODEL } from '@/lib/anthropic'
import { LANG_NAMES } from '@/lib/langNames'

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 })

  const { content, targetLang } = await req.json()
  if (!content) return NextResponse.json({ error: 'Missing document content.' }, { status: 400 })

  const langName = LANG_NAMES[targetLang] || targetLang

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: 'You are a professional translator. Translate accurately while preserving the style of the original. Return only the translated text.',
      messages: [{
        role: 'user',
        content: `Translate this text to ${langName}. Preserve the formatting and structure.\n\nTEXT:\n${content.slice(0, 4000)}`,
      }],
    })

    const result = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    if (!result) return NextResponse.json({ error: 'AI returned an empty response.' }, { status: 502 })

    return NextResponse.json({ result })
  } catch (err: any) {
    console.error('[DocMind] translate error:', err.message)
    const status = err.status === 429 ? 429 : 502
    return NextResponse.json({ error: err.message ?? 'Server error.' }, { status })
  }
}

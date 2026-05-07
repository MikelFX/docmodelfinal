import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODEL } from '@/lib/anthropic'
import { LANG_NAMES } from '@/lib/langNames'

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 })

  const { description, language } = await req.json()
  if (!description) return NextResponse.json({ error: 'Missing template description.' }, { status: 400 })

  const langName = LANG_NAMES[language] ?? 'English'

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: `You are a legal and business writing assistant. Generate professional documents and templates in ${langName}. Return only the finished document with no commentary.`,
      messages: [{
        role: 'user',
        content: `Generate a professional document or template based on this description:\n\n${description}\n\nThe document must be complete, professional, and ready to use.`,
      }],
    })

    const result = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    if (!result) return NextResponse.json({ error: 'AI returned an empty response.' }, { status: 502 })

    return NextResponse.json({ result })
  } catch (err: any) {
    console.error('[DocMind] template error:', err.message)
    const status = err.status === 429 ? 429 : 502
    return NextResponse.json({ error: err.message ?? 'Server error.' }, { status })
  }
}

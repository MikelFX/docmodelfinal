import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODEL } from '@/lib/anthropic'
import { LANG_NAMES } from '@/lib/langNames'

const TYPE_LABELS: Record<string, string> = {
  website: 'complete website (HTML + CSS + JavaScript, single .html file)',
  landing: 'landing page (HTML + CSS + JavaScript, single .html file, focused conversion design)',
  component: 'React TypeScript component (.tsx)',
  script: 'JavaScript script',
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Chybí ANTHROPIC_API_KEY' }, { status: 500 })

  const { description, type, language } = await req.json()
  if (!description) return NextResponse.json({ error: 'Chybí popis projektu.' }, { status: 400 })

  const typeLabel = TYPE_LABELS[type] || TYPE_LABELS.website
  const langName = LANG_NAMES[language] ?? 'English'
  const lang = `with ${langName} text and comments`

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: 'You are an expert web developer and programmer. Generate complete, production-ready code based on the description. Return ONLY the raw code — no markdown code fences, no explanations, no preamble. The code must be immediately usable and complete.',
      messages: [{
        role: 'user',
        content: `Create a ${typeLabel} ${lang}.\n\nDescription:\n${description}\n\nRequirements:\n- Complete and fully working code\n- Modern, clean design for web projects\n- For HTML projects: single self-contained file with embedded CSS and JS\n- No placeholder content — make it realistic and complete`,
      }],
    })

    const result = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    if (!result) return NextResponse.json({ error: 'AI vrátilo prázdnou odpověď.' }, { status: 502 })

    return NextResponse.json({ result })
  } catch (err: any) {
    console.error('[DocMind] codegen error:', err.message)
    const status = err.status === 429 ? 429 : 502
    return NextResponse.json({ error: err.message ?? 'Chyba serveru.' }, { status })
  }
}

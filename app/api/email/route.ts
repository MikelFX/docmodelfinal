import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { anthropic, MODEL } from '@/lib/anthropic'

const LANG_NAMES: Record<string, string> = {
  cs: 'Czech', en: 'English', de: 'German', sk: 'Slovak', pl: 'Polish',
  fr: 'French', es: 'Spanish', it: 'Italian', nl: 'Dutch', pt: 'Portuguese',
  ro: 'Romanian', hu: 'Hungarian', sv: 'Swedish', da: 'Danish', fi: 'Finnish',
  el: 'Greek', hr: 'Croatian', bg: 'Bulgarian', sl: 'Slovenian',
  et: 'Estonian', lv: 'Latvian', lt: 'Lithuanian',
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 })

  const { content, emailType, recipient, tone, language } = await req.json()
  if (!content) return NextResponse.json({ error: 'Missing document content.' }, { status: 400 })

  const toneDesc = tone === 'friendly' ? 'friendly, direct and human' : 'formal, professional and polite'
  const langName = LANG_NAMES[language] ?? 'English'
  const langInstruction = `Write the email in ${langName}.`

  const typePrompts: Record<string, string> = {
    followup: 'Meeting follow-up email — summarize key conclusions, agreements and next steps.',
    response: 'Response to a complaint or claim — empathetic, constructive, offer a solution.',
    proposal: 'Business offer or partnership proposal — persuasive, clear benefits, call to action.',
    reminder: 'Deadline or unresolved task reminder — polite but clear and specific.',
    request: 'Request for information, documents or cooperation — concise, explain why and what you need.',
  }

  const typeDesc = typePrompts[emailType] ?? 'Professional email based on the document.'
  const recipientLine = recipient ? `Recipient: ${recipient}` : ''

  const userMessage = `Write an email based on this document.

Email type: ${typeDesc}
Tone: ${toneDesc}
${recipientLine}
${langInstruction}

Output format (follow exactly):
Subject: [email subject]

[email body — greeting, content, closing, signature "Best regards, [Name]"]

DOCUMENT:
${content.slice(0, 3500)}`

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1200,
      system: 'You are an expert email writer. You write persuasive, clear emails adapted to context. Return only the finished email.',
      messages: [{ role: 'user', content: userMessage }],
    })

    const result = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    if (!result) return NextResponse.json({ error: 'AI returned an empty response.' }, { status: 502 })

    return NextResponse.json({ result })
  } catch (err: any) {
    console.error('[DocMind] email error:', err.message)
    const status = err.status === 429 ? 429 : 502
    return NextResponse.json({ error: err.message ?? 'Server error.' }, { status })
  }
}

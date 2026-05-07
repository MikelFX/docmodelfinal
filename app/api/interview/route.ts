import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODEL } from '@/lib/anthropic'
import { langInstruction } from '@/lib/langNames'

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 })

  const { docType, history, userAnswer, lang } = await req.json()
  if (!docType) return NextResponse.json({ error: 'Missing document type.' }, { status: 400 })

  const systemPrompt = `You are an assistant helping the user fill out a document through a conversation.
Document type: ${docType}
Ask exactly ONE question at a time. Once you have enough information, return the complete filled document.
When the user has answered all necessary questions, write "DOCUMENT_COMPLETE:" followed by the full document.
Otherwise write only the next question.
${langInstruction(lang ?? 'en')}`

  const trimmedHistory = (history || []).slice(-8)

  const messages = [
    ...trimmedHistory,
    ...(userAnswer ? [{ role: 'user' as const, content: userAnswer }] : []),
    ...(!history?.length ? [{ role: 'user' as const, content: `Start the conversation for creating: ${docType}` }] : []),
  ]

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    let result = message.content[0].type === 'text' ? message.content[0].text : ''
    result = result.replace(/```/g, '').trim()
    if (!result) throw new Error('AI returned an empty response.')

    const isFinished = result.includes('DOCUMENT_COMPLETE:')
    const document = isFinished ? result.split('DOCUMENT_COMPLETE:')[1].trim() : null
    const question = isFinished ? null : result

    return NextResponse.json({ question, document, isFinished })
  } catch (err: any) {
    console.error('[DocMind] interview error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 502 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODEL } from '@/lib/anthropic'

type Mode = 'summary' | 'actions' | 'risks' | 'qa' | 'deadlines'

const PROMPTS: Record<Mode, string> = {
  summary: `Analyze the document and return a structured summary as HTML.
Use <h4 style="color:#AFA9EC;margin:0 0 8px;font-size:13px;font-weight:500"> for headings
and <p style="margin:0 0 12px;color:#c8c4e8;font-size:13px;line-height:1.8"> for paragraphs.
No markdown, no backticks. Return ONLY HTML.`,

  actions: `Find action items and tasks in the document. Return as an HTML list.
Each item: <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
<span style="display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;background:#1a2e1a;color:#5DCAA5;flex-shrink:0">action</span>
<span style="font-size:13px;color:#c8c4e8;line-height:1.7">task description</span></div>
Return ONLY HTML fragments, no markdown.`,

  risks: `Identify risks and issues in the document.
Each risk: <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
<span style="display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;background:#2e1a1a;color:#F09595;flex-shrink:0">risk</span>
<span style="font-size:13px;color:#c8c4e8;line-height:1.7">risk description</span></div>
Return ONLY HTML fragments, no markdown.`,

  qa: `Generate 5 key questions and answers from the document.
Format: <div style="margin-bottom:16px;padding:12px;background:#13111f;border-radius:8px;border:0.5px solid #2a2640">
<p style="font-size:12px;color:#7F77DD;margin:0 0 6px;font-weight:500">Question?</p>
<p style="font-size:13px;color:#c8c4e8;margin:0;line-height:1.7">Answer...</p></div>
Return ONLY HTML fragments, no markdown.`,

  deadlines: `Extract ALL dates, deadlines, and time-based commitments from the document. Return as an HTML table.
Table header:
<table style="width:100%;border-collapse:collapse;font-size:13px">
<thead><tr>
<th style="text-align:left;padding:8px 12px;border-bottom:0.5px solid #2a2640;color:#AFA9EC;font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:0.06em">Date / Deadline</th>
<th style="text-align:left;padding:8px 12px;border-bottom:0.5px solid #2a2640;color:#AFA9EC;font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:0.06em">Description</th>
<th style="text-align:left;padding:8px 12px;border-bottom:0.5px solid #2a2640;color:#AFA9EC;font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:0.06em">Responsible</th>
<th style="text-align:left;padding:8px 12px;border-bottom:0.5px solid #2a2640;color:#AFA9EC;font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:0.06em">Priority</th>
</tr></thead>
<tbody>
[rows in format:]
<tr style="border-bottom:0.5px solid #1a1730">
<td style="padding:9px 12px;color:#c8c4e8;white-space:nowrap">DD.MM.YYYY or description</td>
<td style="padding:9px 12px;color:#c8c4e8">deadline or task description</td>
<td style="padding:9px 12px;color:#888">name or — if unknown</td>
<td style="padding:9px 12px"><span style="padding:2px 8px;border-radius:10px;font-size:11px;background:#2e1a1a;color:#F09595">high</span></td>
</tr>
</tbody></table>
Priority: high (red #F09595 / bg #2e1a1a), medium (yellow #F5C842 / bg #2e2a1a), low (green #5DCAA5 / bg #1a2e1a).
If no deadlines found, return: <p style="color:#666;font-size:13px">No specific dates or deadlines were found in the document.</p>
Return ONLY HTML, no markdown.`,
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY in .env.local' }, { status: 500 })
  }

  let body: { content?: string; mode?: string; question?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { content, mode, question } = body
  if (!content) {
    return NextResponse.json({ error: 'Missing document content.' }, { status: 400 })
  }

  const systemPrompt = question
    ? 'You are an analytical assistant. Answer concisely and factually. Mirror the language the user writes in.'
    : 'You are an analytical assistant. Respond ONLY as HTML fragments. No markdown, no backticks, no DOCTYPE.'

  const userMessage = question
    ? `Based on the document, answer: "${question}"\n\nDOCUMENT:\n${content.slice(0, 2000)}\n\nAnswer concisely.`
    : PROMPTS[(mode as Mode) ?? 'summary'] + '\n\nDOCUMENT:\n' + content.slice(0, 3000)

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    let result = message.content[0].type === 'text' ? message.content[0].text : ''
    result = result.replace(/```html/gi, '').replace(/```/g, '').trim()

    if (!result) return NextResponse.json({ error: 'AI returned an empty response. Try again.' }, { status: 502 })

    return NextResponse.json({ result })
  } catch (err: any) {
    console.error('[DocMind] analyze error:', err.message)
    const status = err.status === 429 ? 429 : 502
    const msg = err.status === 429
      ? 'Request limit exceeded. Wait a moment and try again.'
      : err.message ?? 'AI server error.'
    return NextResponse.json({ error: msg }, { status })
  }
}

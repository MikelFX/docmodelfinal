import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODEL } from '@/lib/anthropic'
import { langInstruction } from '@/lib/langNames'

type Mode = 'summary' | 'actions' | 'risks' | 'clauses' | 'deadlines' | 'finance' | 'compare'

const PROMPTS: Record<Mode, string> = {
  summary: `Analyze this document and produce a comprehensive structured summary in HTML.

Use this structure:
<h4 style="color:#AFA9EC;margin:16px 0 8px;font-size:13px;font-weight:600">Document Overview</h4>
<p style="margin:0 0 12px;color:#c8c4e8;font-size:13px;line-height:1.8">Type of document, all parties involved, main purpose.</p>

<h4 style="color:#AFA9EC;margin:16px 0 8px;font-size:13px;font-weight:600">Key Points</h4>
[5–8 numbered points, each as:]
<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px">
<span style="display:inline-block;min-width:20px;height:20px;background:rgba(127,119,221,0.15);border-radius:50%;font-size:11px;color:#AFA9EC;text-align:center;line-height:20px;flex-shrink:0;font-weight:600">N</span>
<span style="font-size:13px;color:#c8c4e8;line-height:1.75">key point</span>
</div>

<h4 style="color:#AFA9EC;margin:16px 0 8px;font-size:13px;font-weight:600">Important Conditions & Requirements</h4>
<p style="margin:0 0 12px;color:#c8c4e8;font-size:13px;line-height:1.8">Specific obligations, conditions, or requirements.</p>

<h4 style="color:#AFA9EC;margin:16px 0 8px;font-size:13px;font-weight:600">Figures & Dates</h4>
<p style="margin:0 0 12px;color:#c8c4e8;font-size:13px;line-height:1.8">All monetary amounts, percentages, deadlines, and specific dates.</p>

<h4 style="color:#AFA9EC;margin:16px 0 8px;font-size:13px;font-weight:600">Recommended Next Steps</h4>
<p style="margin:0;color:#c8c4e8;font-size:13px;line-height:1.8">Concrete actions implied or required by this document.</p>

Be specific — include actual names, amounts, and dates from the document. Return ONLY HTML.`,

  actions: `Extract ALL action items and tasks from this document. Group by priority.

<h4 style="color:#F09595;margin:0 0 10px;font-size:13px;font-weight:600">🔴 Urgent / Critical</h4>
<h4 style="color:#F5C842;margin:20px 0 10px;font-size:13px;font-weight:600">🟡 Important</h4>
<h4 style="color:#AFA9EC;margin:20px 0 10px;font-size:13px;font-weight:600">🔵 Standard / Routine</h4>

For each action item use this exact format:
<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px">
<span style="display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;background:#1a2e1a;color:#5DCAA5;flex-shrink:0;margin-top:2px">action</span>
<div>
<span style="font-size:13px;color:#c8c4e8;line-height:1.7;display:block">task description — be specific about what needs to be done</span>
<div style="display:flex;gap:10px;margin-top:5px;flex-wrap:wrap">
[if responsible person mentioned:] <span style="font-size:11px;color:#555080">👤 person name</span>
[if deadline mentioned:] <span style="font-size:11px;color:#F5C842">📅 specific deadline</span>
</div>
</div>
</div>

If no items in a priority group, omit that section. If no action items found, say so.
Return ONLY HTML fragments, no markdown.`,

  risks: `Perform a thorough risk analysis of this document. Organize by severity.

<h4 style="color:#F09595;margin:0 0 12px;font-size:13px;font-weight:600">🔴 Critical Issues</h4>
[Deal-breakers, illegal clauses, significant liability exposure, highly unfavorable terms]

<h4 style="color:#F5C842;margin:20px 0 12px;font-size:13px;font-weight:600">🟡 Moderate Concerns</h4>
[Terms worth negotiating or seeking clarification on before signing]

<h4 style="color:#5DCAA5;margin:20px 0 12px;font-size:13px;font-weight:600">🟢 Missing Protections</h4>
[Important clauses or safeguards absent from the document that you should request]

For each risk use this format:
<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:14px">
<span style="display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;background:#2e1a1a;color:#F09595;flex-shrink:0;margin-top:2px">risk</span>
<div>
<span style="font-size:13px;color:#c8c4e8;line-height:1.7;display:block">specific description of the risk and its potential impact</span>
<span style="font-size:12px;color:#555080;display:block;margin-top:4px">💡 Recommendation: concrete action to take</span>
</div>
</div>

If the document is not a contract or agreement, analyze it for factual errors, inconsistencies, or concerning statements.
Return ONLY HTML fragments, no markdown.`,

  clauses: `Extract and analyze all significant clauses from this document. Be thorough.

For each clause use this format:
<div style="margin-bottom:16px;padding:14px 16px;background:#0f0d1e;border-radius:10px;border:0.5px solid #2a2640">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
  <span style="font-size:11px;color:#AFA9EC;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">CLAUSE TYPE</span>
  <span style="padding:2px 10px;border-radius:20px;font-size:11px;font-weight:500;[STATUS COLORS]">STATUS</span>
</div>
<p style="font-size:12px;color:#3d3a55;margin:0 0 8px;font-style:italic;line-height:1.6">"relevant quote from document"</p>
<p style="font-size:13px;color:#c8c4e8;margin:0;line-height:1.75">Plain-language explanation of what this means and its practical implication</p>
</div>

Status badge colors:
- FAIR: background:#1a2e1a; color:#5DCAA5 (standard, balanced terms)
- REVIEW: background:#2e2a1a; color:#F5C842 (review before signing)
- UNFAVORABLE: background:#2e1a1a; color:#F09595 (bad terms for you)
- MISSING: background:#1a1a2e; color:#5558a0 (important clause not present)

Cover ALL of these clause types (if MISSING, show the missing version with a note explaining why it matters):
1. Payment Terms (amounts, schedule, late payment penalties)
2. Termination (conditions, notice period, consequences, who can terminate)
3. Liability Limitation (caps, exclusions, indemnification)
4. Intellectual Property (ownership, license rights, work-for-hire)
5. Confidentiality / NDA obligations
6. Warranties & Representations
7. Dispute Resolution (jurisdiction, arbitration, governing law)
8. Force Majeure
9. Non-compete / Non-solicitation (if present)
10. Any other significant clause specific to this document

If this is not a legal document, extract the key terms, conditions, obligations, and commitments instead.
Return ONLY HTML, no markdown.`,

  deadlines: `Extract ALL dates, deadlines, and time-based commitments from the document.

<table style="width:100%;border-collapse:collapse;font-size:13px">
<thead><tr>
<th style="text-align:left;padding:8px 12px;border-bottom:0.5px solid #2a2640;color:#AFA9EC;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.06em">Date / Deadline</th>
<th style="text-align:left;padding:8px 12px;border-bottom:0.5px solid #2a2640;color:#AFA9EC;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.06em">Description</th>
<th style="text-align:left;padding:8px 12px;border-bottom:0.5px solid #2a2640;color:#AFA9EC;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.06em">Responsible</th>
<th style="text-align:left;padding:8px 12px;border-bottom:0.5px solid #2a2640;color:#AFA9EC;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.06em">Priority</th>
</tr></thead>
<tbody>
[rows in format:]
<tr style="border-bottom:0.5px solid #1a1730">
<td style="padding:9px 12px;color:#c8c4e8;white-space:nowrap;font-weight:500">DD.MM.YYYY or description</td>
<td style="padding:9px 12px;color:#c8c4e8">deadline or task description</td>
<td style="padding:9px 12px;color:#888">name or — if unknown</td>
<td style="padding:9px 12px"><span style="padding:2px 8px;border-radius:10px;font-size:11px;background:#2e1a1a;color:#F09595">high</span></td>
</tr>
</tbody></table>
Priority: high (bg:#2e1a1a, color:#F09595), medium (bg:#2e2a1a, color:#F5C842), low (bg:#1a2e1a, color:#5DCAA5).
If no deadlines found: <p style="color:#555080;font-size:13px">No specific dates or deadlines were found in the document.</p>
Return ONLY HTML, no markdown.`,

  finance: `You are a senior financial analyst. Perform a deep financial analysis of this document. Cover ALL relevant sections:

1. Financial obligations & payment terms (amounts, schedule, currency)
2. Prices, fees, penalties, bonuses and escalation clauses
3. Revenue / cost projections or estimates
4. Financial risks and hidden liabilities
5. Cash flow implications (when money moves and in which direction)
6. Hidden costs, unfavorable conditions, or financial red flags

Format each section:
<h4 style="color:#F5C842;margin:16px 0 8px;font-size:13px;font-weight:600">Section title</h4>

For each finding:
<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
<span style="display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;background:#2e2a1a;color:#F5C842;flex-shrink:0">finance</span>
<span style="font-size:13px;color:#c8c4e8;line-height:1.7">finding with specific amounts where available</span></div>

If a finding is a risk: background:#2e1a1a color:#F09595 label "risk"
If a finding is positive/favorable: background:#1a2e1a color:#5DCAA5 label "positive"

End with:
<div style="margin-top:20px;padding:14px;background:#13111f;border-radius:10px;border:0.5px solid #2e2a1a">
<p style="font-size:12px;color:#F5C842;margin:0 0 6px;font-weight:600">Financial summary</p>
<p style="font-size:13px;color:#c8c4e8;margin:0;line-height:1.8">Overall financial assessment in 2-3 sentences.</p></div>

Return ONLY HTML fragments, no markdown, no backticks.`,

  compare: `You are comparing two document versions. Document 1 is the ORIGINAL, Document 2 is the NEW version. Identify all meaningful differences and assess their impact.

<div style="margin-bottom:20px;padding:14px 16px;background:#13111f;border-radius:10px;border:0.5px solid #2a2640">
<p style="font-size:11px;color:#AFA9EC;margin:0 0 6px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Overall Assessment</p>
<p style="font-size:13px;color:#c8c4e8;margin:0;line-height:1.8">Summary of what changed and net impact on each party.</p>
</div>

<h4 style="color:#F09595;margin:0 0 12px;font-size:13px;font-weight:600">🔴 High-Impact Changes</h4>
<h4 style="color:#F5C842;margin:20px 0 12px;font-size:13px;font-weight:600">🟡 Notable Changes</h4>
<h4 style="color:#5DCAA5;margin:20px 0 12px;font-size:13px;font-weight:600">🟢 Minor / Administrative Changes</h4>

For each change:
<div style="margin-bottom:14px;padding:13px;background:#0f0d1e;border-radius:9px;border:0.5px solid #2a2640">
<div style="font-size:11px;color:#AFA9EC;font-weight:600;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.05em">SECTION NAME</div>
<div style="background:#2e1a1a;border-radius:5px;padding:8px 10px;margin-bottom:6px;font-size:12px;color:#F09595;line-height:1.6">− Before: "original wording"</div>
<div style="background:#1a2e1a;border-radius:5px;padding:8px 10px;margin-bottom:9px;font-size:12px;color:#5DCAA5;line-height:1.6">+ After: "new wording"</div>
<span style="font-size:13px;color:#c8c4e8;line-height:1.7">What this change means and which party benefits</span>
</div>

If the documents appear unrelated or cannot be compared, state this clearly.
Return ONLY HTML, no markdown.`,
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY in .env.local' }, { status: 500 })
  }

  let body: { content?: string; content2?: string; mode?: string; question?: string; lang?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { content, content2, mode, question, lang } = body
  if (!content) {
    return NextResponse.json({ error: 'Missing document content.' }, { status: 400 })
  }

  const langHint = langInstruction(lang ?? 'en')

  const systemPrompt = question
    ? `You are an analytical assistant. Answer concisely and factually. Never use markdown formatting — no asterisks, no hashtags, no bold/italic syntax. Plain text only. ${langHint}`
    : `You are an analytical assistant. Respond ONLY as HTML fragments. No markdown, no backticks, no DOCTYPE. ${langHint}`

  let userMessage: string
  if (question) {
    userMessage = `Based on the document, answer: "${question}"\n\nDOCUMENT:\n${content.slice(0, 4000)}\n\nAnswer concisely.`
  } else if (mode === 'compare' && content2) {
    userMessage = PROMPTS.compare + '\n\nDOCUMENT 1 (Original):\n' + content.slice(0, 4000) + '\n\nDOCUMENT 2 (New version):\n' + content2.slice(0, 4000)
  } else {
    userMessage = PROMPTS[(mode as Mode) ?? 'summary'] + '\n\nDOCUMENT:\n' + content.slice(0, 8000)
  }

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
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

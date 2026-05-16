'use client'

import { Analysis, computeRiskScore, VERDICT_EN, VERDICT_EMOJI } from './analysisUtils'

const VERDICT_COLOR: Record<string, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
}

const VERDICT_BG: Record<string, string> = {
  green: '#f0fdf4',
  yellow: '#fefce8',
  red: '#fef2f2',
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function generateActionItems(analysis: Analysis): string[] {
  const items: string[] = []
  if (analysis.verdict === 'reject') {
    items.push('Do NOT sign this contract in its current form — significant issues must be resolved first.')
    items.push('Consult a qualified legal professional to review the identified risks.')
    items.push('Request substantial modifications from the other party before proceeding.')
  } else if (analysis.verdict === 'modify') {
    items.push('Do not sign yet — negotiate the flagged clauses with the other party first.')
    items.push('Highlight each identified risk and propose specific modifications in writing.')
    items.push('Once revisions are agreed, request an updated contract for final review.')
  } else {
    items.push('This contract appears safe to sign based on the AI analysis.')
    items.push('Review all terms one final time before signing.')
    items.push('Keep a signed copy in a secure location for your records.')
  }
  const red = analysis.risks.filter(r => r.level === 'red')
  if (red.length > 0) {
    items.push(`Address ${red.length} high-severity risk${red.length > 1 ? 's' : ''}: ${red.map(r => r.title).join(', ')}.`)
  }
  if (analysis.missing.length > 0) {
    items.push(`Request the ${analysis.missing.length} missing clause${analysis.missing.length > 1 ? 's' : ''} be added before signing.`)
  }
  items.push('Keep all communications with the other party in writing for legal protection.')
  return items.slice(0, 6)
}

function generateQuestions(analysis: Analysis): string[] {
  const q: string[] = [
    'Can I request modifications to the flagged clauses?',
    'What are the exact termination conditions and any associated penalties?',
    'Is this contract governed by the laws of my jurisdiction?',
  ]
  if (analysis.risks.some(r => r.level === 'red')) {
    q.push('Can you explain the high-risk clauses in plain language?')
    q.push('Are these standard terms, or can they be negotiated?')
  }
  if (analysis.missing.length > 0) {
    q.push('Why are certain protective clauses missing from this contract?')
  }
  q.push('What happens if either party cannot fulfill their obligations?')
  q.push('Is there a dispute resolution or mediation process outlined?')
  return q.slice(0, 6)
}

function buildHTML(analysis: Analysis, docName: string): string {
  const date = new Date().toLocaleString()
  const riskScore = computeRiskScore(analysis)
  const verdictText = VERDICT_EN[analysis.verdict] ?? analysis.verdictCZ
  const verdictEmoji = VERDICT_EMOJI[analysis.verdict] ?? ''
  const color = VERDICT_COLOR[analysis.verdictColor] ?? '#7F77DD'
  const bg = VERDICT_BG[analysis.verdictColor] ?? '#f5f3ff'
  const actions = generateActionItems(analysis)
  const questions = generateQuestions(analysis)

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#1a1a2e;width:794px}
.page{width:794px;min-height:1123px;padding:56px 64px;background:#fff;position:relative}
.logo{display:flex;align-items:center;gap:10px;margin-bottom:40px}
.logo-text{font-size:20px;font-weight:800;color:#7F77DD}
.section-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9ca3af;margin-bottom:16px}
.page-title{font-size:28px;font-weight:800;color:#1a1a2e;margin-bottom:28px}
.cover-doc{font-size:14px;color:#6b7280;margin-bottom:6px}
.cover-date{font-size:13px;color:#9ca3af;margin-bottom:40px}
.verdict-wrap{display:flex;flex-direction:column;align-items:center;gap:14px;margin-bottom:36px}
.verdict-badge{display:inline-flex;align-items:center;gap:14px;padding:18px 40px;border-radius:18px;background:${bg};border:2.5px solid ${color};font-size:24px;font-weight:800;color:${color};letter-spacing:-.3px}
.verdict-emoji{font-size:32px}
.risk-score{font-size:16px;font-weight:700;color:#374151;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:10px 24px}
.cover-summary{font-size:14px;color:#4b5563;line-height:1.75;max-width:600px;margin:0 auto 40px;text-align:center}
.disclaimer{position:absolute;bottom:48px;left:64px;right:64px;font-size:11px;color:#9ca3af;line-height:1.5;padding:14px 18px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;text-align:center}
.risk-table{width:100%;border-collapse:collapse;margin-bottom:28px}
.risk-table th{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;padding:10px 14px;background:#f9fafb;border-bottom:1.5px solid #e5e7eb;text-align:left}
.risk-table td{padding:11px 14px;font-size:13px;vertical-align:top;border-bottom:1px solid #f3f4f6}
.row-red td{background:#fef2f2}
.row-yellow td{background:#fefce8}
.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
.badge-red{background:#fee2e2;color:#dc2626}
.badge-yellow{background:#fef9c3;color:#ca8a04}
.risk-title-col{font-weight:600;color:#1f2937;width:200px}
.risk-desc-col{color:#6b7280;line-height:1.5}
.missing-list{list-style:none;display:flex;flex-direction:column;gap:6px;margin-bottom:24px}
.missing-item{display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280}
.missing-dot{width:6px;height:6px;border-radius:50%;background:#d1d5db;flex-shrink:0;margin-top:5px}
.block{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:18px 22px;margin-bottom:18px}
.block-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#7F77DD;margin-bottom:10px}
.block-text{font-size:14px;color:#374151;line-height:1.75}
.actions{display:flex;flex-direction:column;gap:10px;margin-bottom:28px}
.action-item{display:flex;gap:14px;padding:14px 16px;background:${bg};border:1px solid ${color}33;border-radius:10px;font-size:13px;color:#374151;line-height:1.6}
.action-num{width:22px;height:22px;background:${color};color:#fff;border-radius:50%;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.q-block{background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px 22px;margin-bottom:28px}
.q-title{font-size:14px;font-weight:700;color:#1d4ed8;margin-bottom:12px}
.q-item{font-size:13px;color:#1e40af;padding:6px 0;border-bottom:1px solid #dbeafe;line-height:1.5}
.page4-footer{border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;color:#9ca3af;font-size:12px}
</style></head><body>

<div class="page">
  <div class="logo"><span style="font-size:24px">🛡️</span><span class="logo-text">DocThink</span></div>
  <div class="section-label">Contract Analysis Report</div>
  <div style="font-size:32px;font-weight:800;color:#1a1a2e;margin-bottom:14px">Analysis Complete</div>
  <div class="cover-doc">Document: <strong>${esc(docName)}</strong></div>
  <div class="cover-date">Analyzed: ${date}</div>
  <div class="verdict-wrap">
    <div class="verdict-badge"><span class="verdict-emoji">${verdictEmoji}</span>${verdictText}</div>
    <div class="risk-score">Risk Score: ${riskScore} / 10</div>
  </div>
  <p class="cover-summary">${esc(analysis.summary)}</p>
  <div class="disclaimer">This report was generated by DocThink AI. It does not constitute legal advice. Always consult a qualified legal professional before signing any contract.</div>
</div>

<div class="page">
  <div class="logo"><span style="font-size:24px">🛡️</span><span class="logo-text">DocThink</span></div>
  <div class="section-label">Risk Assessment</div>
  <div class="page-title">Identified Risks</div>
  ${analysis.risks.length === 0
    ? '<p style="font-size:14px;color:#6b7280">No significant risks identified.</p>'
    : `<table class="risk-table"><thead><tr><th>Risk</th><th>Severity</th><th>Details</th></tr></thead><tbody>
${analysis.risks.slice(0, 10).map(r => `<tr class="row-${r.level}">
  <td class="risk-title-col">${esc(r.title)}</td>
  <td><span class="badge badge-${r.level}">${r.level === 'red' ? 'HIGH' : 'MEDIUM'}</span></td>
  <td class="risk-desc-col">${esc(r.description)}</td>
</tr>`).join('')}
</tbody></table>`}
  ${analysis.missing.length > 0 ? `
  <div class="section-label" style="margin-top:24px">Missing Elements</div>
  <ul class="missing-list">${analysis.missing.map(m => `<li class="missing-item"><span class="missing-dot"></span><span>${esc(m)}</span></li>`).join('')}</ul>` : ''}
</div>

<div class="page">
  <div class="logo"><span style="font-size:24px">🛡️</span><span class="logo-text">DocThink</span></div>
  <div class="section-label">Full Analysis</div>
  <div class="page-title">AI Interpretation</div>
  <div class="block"><div class="block-label">Summary</div><div class="block-text">${esc(analysis.summary)}</div></div>
  <div class="block"><div class="block-label">Recommendation</div><div class="block-text">${esc(analysis.recommendation)}</div></div>
  ${analysis.risks.length > 0 ? `<div class="block"><div class="block-label">Key Risk Areas</div><div class="block-text">
${analysis.risks.map(r => `<strong>${esc(r.title)}:</strong> ${esc(r.description)}`).join('<br><br>')}
</div></div>` : ''}
</div>

<div class="page">
  <div class="logo"><span style="font-size:24px">🛡️</span><span class="logo-text">DocThink</span></div>
  <div class="section-label">Action Plan</div>
  <div class="page-title">What to Do Next</div>
  <div class="actions">${actions.map((a, i) => `<div class="action-item"><div class="action-num">${i + 1}</div><div>${esc(a)}</div></div>`).join('')}</div>
  <div class="q-block">
    <div class="q-title">Questions to Ask Before Signing</div>
    ${questions.map(q => `<div class="q-item">• ${esc(q)}</div>`).join('')}
  </div>
  <div class="page4-footer"><strong>DocThink</strong> — AI Contract Analysis · docthink.ai<br>Generated automatically · Not legal advice</div>
</div>

</body></html>`
}

export async function exportPDF(
  analysis: Analysis,
  docName?: string,
  onProgress?: (msg: string) => void
): Promise<Blob | null> {
  onProgress?.('Preparing PDF...')

  const [{ jsPDF }, html2canvasModule] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])
  const html2canvas = html2canvasModule.default

  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;background:#fff;overflow:visible;'
  document.body.appendChild(container)

  try {
    container.innerHTML = buildHTML(analysis, docName || 'Contract')
    await new Promise(r => setTimeout(r, 250))

    const pages = container.querySelectorAll<HTMLElement>('.page')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    for (let i = 0; i < pages.length; i++) {
      onProgress?.(`Generating PDF... (${i + 1}/${pages.length})`)
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        height: 1123,
      })
      const img = canvas.toDataURL('image/jpeg', 0.88)
      if (i > 0) pdf.addPage()
      pdf.addImage(img, 'JPEG', 0, 0, 210, 297)
    }

    onProgress?.('Saving...')
    const blob = pdf.output('blob')
    const date = new Date().toISOString().split('T')[0]
    const filename = `docthink-analysis-${date}.pdf`

    // Try Web Share API with file first (Android TWA)
    if (typeof navigator.canShare === 'function') {
      const file = new File([blob], filename, { type: 'application/pdf' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'DocThink Contract Analysis' })
        return blob
      }
    }

    // Fallback: direct download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    return blob
  } finally {
    document.body.removeChild(container)
  }
}

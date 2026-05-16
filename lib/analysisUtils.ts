export interface Risk {
  level: 'red' | 'yellow'
  title: string
  description: string
}

export interface Analysis {
  verdict: 'sign' | 'modify' | 'reject'
  verdictCZ: string
  verdictColor: 'green' | 'yellow' | 'red'
  summary: string
  risks: Risk[]
  missing: string[]
  recommendation: string
}

export const VERDICT_EN: Record<string, string> = {
  sign: 'SAFE TO SIGN',
  modify: 'NEEDS REVISION',
  reject: 'DO NOT SIGN',
}

export const VERDICT_EMOJI: Record<string, string> = {
  sign: '✅',
  modify: '⚠️',
  reject: '🚫',
}

export function computeRiskScore(analysis: Analysis): number {
  const base = ({ sign: 1.5, modify: 5, reject: 8 } as Record<string, number>)[analysis.verdict] ?? 5
  const redCount = analysis.risks.filter(r => r.level === 'red').length
  const yellowCount = analysis.risks.filter(r => r.level === 'yellow').length
  return Math.min(10, Math.round((base + redCount * 0.6 + yellowCount * 0.25) * 10) / 10)
}

export function getAnalysisSummaryText(analysis: Analysis, docName?: string): string {
  const verdictEmoji = VERDICT_EMOJI[analysis.verdict] ?? ''
  const verdictText = VERDICT_EN[analysis.verdict] ?? analysis.verdictCZ
  const riskScore = computeRiskScore(analysis)
  const topRisks = analysis.risks.slice(0, 3).map(r => `• ${r.title}`).join('\n')

  return [
    '📄 DocThink Contract Analysis',
    '━━━━━━━━━━━━━━━━━━━━━',
    docName ? `Document: ${docName}` : null,
    `Verdict: ${verdictEmoji} ${verdictText}`,
    `Risk Score: ${riskScore}/10`,
    '',
    analysis.risks.length > 0 ? `⚠️ Top Risks:\n${topRisks}` : '✅ No significant risks found',
    '',
    '📱 Analyzed with DocThink',
    'docthink.ai',
  ].filter(l => l !== null).join('\n').trim()
}

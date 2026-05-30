import { Redis } from '@upstash/redis'
import { notFound } from 'next/navigation'
import styles from './page.module.css'
import type { Metadata } from 'next'

const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
  : null

const VERDICT_EMOJI: Record<string, string> = { sign: '✅', modify: '⚠️', reject: '🚫' }

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: 'Analýza smlouvy — DocThink',
    description: 'Zobrazit výsledek AI analýzy smlouvy.',
  }
}

export default async function SharePage({ params }: { params: { id: string } }) {
  const { id } = params

  if (!redis || !/^[a-f0-9]{12}$/.test(id)) notFound()

  const raw = await redis.get<unknown>(`share:${id}`)
  if (!raw) notFound()

  const data = (typeof raw === 'string' ? JSON.parse(raw) : raw) as {
    analysis: {
      verdict: string
      verdictCZ: string
      verdictColor: string
      summary: string
      risks: { level: string; title: string; description: string }[]
      missing: string[]
      recommendation?: string
    }
    docName?: string | null
  }

  const { analysis, docName } = data

  return (
    <div className={styles.wrap}>
      <nav className={styles.nav}>
        <div className={styles.logo}>🛡️ DocThink</div>
        <a href="/app" className={styles.tryBtn}>Analyzovat svou smlouvu →</a>
      </nav>

      <div className={styles.content}>
        {docName && <p className={styles.docName}>📄 {docName}</p>}

        <div className={styles.verdict}>
          <span className={styles.verdictEmoji}>{VERDICT_EMOJI[analysis.verdict] ?? '📄'}</span>
          <span className={`${styles.verdictLabel} ${styles[`vc_${analysis.verdictColor}`]}`}>
            {analysis.verdictCZ}
          </span>
        </div>

        <p className={styles.summary}>{analysis.summary}</p>

        {analysis.recommendation && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Doporučení</p>
            <p className={styles.sectionText}>{analysis.recommendation}</p>
          </div>
        )}

        {analysis.risks?.length > 0 && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Rizika ({analysis.risks.length})</p>
            {analysis.risks.map((r, i) => (
              <div key={i} className={`${styles.risk} ${styles[`risk_${r.level}`]}`}>
                <p className={styles.riskTitle}>{r.title}</p>
                <p className={styles.riskDesc}>{r.description}</p>
              </div>
            ))}
          </div>
        )}

        {analysis.missing?.length > 0 && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Chybějící ustanovení</p>
            {analysis.missing.map((m, i) => (
              <div key={i} className={styles.missingItem}>○ {m}</div>
            ))}
          </div>
        )}

        <div className={styles.cta}>
          <p className={styles.ctaText}>Chceš zkontrolovat i svou smlouvu?</p>
          <a href="/app" className={styles.ctaBtn}>Analyzovat zdarma →</a>
          <p className={styles.ctaSub}>První 3 analýzy zdarma · Bez registrace</p>
        </div>
      </div>
    </div>
  )
}

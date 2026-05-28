'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { getLegal } from '@/lib/i18n-legal'

const S: React.CSSProperties = {
  maxWidth: 720, margin: '0 auto', padding: '48px 24px',
  fontFamily: 'system-ui, sans-serif', color: '#e0e0e0',
  background: '#07070d', minHeight: '100vh', lineHeight: 1.7,
}
const H2: React.CSSProperties = { color: '#7F77DD' }
const LINK: React.CSSProperties = { color: '#7F77DD', textDecoration: 'none' }
const SEC: React.CSSProperties = { marginBottom: 32 }

export default function DisclaimerPage() {
  const { lang } = useLanguage()
  const l = getLegal(lang).disclaimer

  return (
    <main style={S}>
      <h1 style={{ color: '#fff', marginBottom: 8 }}>{l.title}</h1>
      <p style={{ color: '#888', marginBottom: 40 }}>{l.updated}</p>

      <div style={{
        background: '#1a0a0a', border: '1px solid #7f2020', borderRadius: 12,
        padding: '16px 20px', marginBottom: 40, display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <p style={{ margin: 0, color: '#f87171', fontWeight: 600 }}>{l.warn}</p>
      </div>

      <section style={SEC}>
        <h2 style={H2}>{l.what.h}</h2>
        <p>{l.what.p}</p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.whatnot.h}</h2>
        <ul>
          {l.whatnot.items.map((item, i) => (
            <li key={i}>{item.pre}<strong>{item.bold}</strong>{item.post}</li>
          ))}
        </ul>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.liability.h}</h2>
        <p>{l.liability.p1}</p>
        <p>{l.liability.p2}</p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.rec.h}</h2>
        <p>{l.rec.intro}</p>
        <ul>{l.rec.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.law.h}</h2>
        <p>{l.law.p}</p>
      </section>

      <section>
        <h2 style={H2}>{l.contact.h}</h2>
        <p>
          {l.contact.p.split('info@docthink.app')[0]}
          <a href="mailto:info@docthink.app" style={LINK}>info@docthink.app</a>
        </p>
      </section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #222', display: 'flex', gap: 24 }}>
        <a href="/privacy" style={LINK}><span style={{ fontSize: 14 }}>{l.lnks.privacy}</span></a>
        <a href="/" style={{ color: '#555', textDecoration: 'none', fontSize: 14 }}>{l.lnks.back}</a>
      </div>
    </main>
  )
}

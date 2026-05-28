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

export default function TermsPage() {
  const { lang } = useLanguage()
  const l = getLegal(lang).terms

  return (
    <main style={S}>
      <h1 style={{ color: '#fff', marginBottom: 8 }}>{l.title}</h1>
      <p style={{ color: '#888', marginBottom: 40 }}>{l.updated}</p>

      <section style={SEC}>
        <h2 style={H2}>{l.op.h}</h2>
        <p>
          {l.op.p.split('info@docthink.app')[0]}
          <a href="mailto:info@docthink.app" style={LINK}>info@docthink.app</a>
          {l.op.p.split('info@docthink.app')[1]}
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.service.h}</h2>
        <p>{l.service.p}</p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.account.h}</h2>
        <ul>{l.account.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.usage.h}</h2>
        <p>{l.usage.intro}</p>
        <ul>{l.usage.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.liability.h}</h2>
        <p>{l.liability.p}</p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.avail.h}</h2>
        <p>{l.avail.p}</p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.changes.h}</h2>
        <p>{l.changes.p}</p>
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

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #222', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <a href="/privacy" style={LINK}><span style={{ fontSize: 14 }}>{l.lnks.privacy}</span></a>
        <a href="/disclaimer" style={LINK}><span style={{ fontSize: 14 }}>{l.lnks.disclaimer}</span></a>
        <a href="/" style={{ color: '#555', textDecoration: 'none', fontSize: 14 }}>{l.lnks.back}</a>
      </div>
    </main>
  )
}

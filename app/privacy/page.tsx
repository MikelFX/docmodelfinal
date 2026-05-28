'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { getLegal } from '@/lib/i18n-legal'

const S: React.CSSProperties = {
  maxWidth: 720, margin: '0 auto', padding: '48px 24px',
  fontFamily: 'system-ui, sans-serif', color: '#e0e0e0',
  background: '#07070d', minHeight: '100vh', lineHeight: 1.7,
}
const H2: React.CSSProperties = { color: '#7F77DD' }
const LINK: React.CSSProperties = { color: '#7F77DD' }
const SEC: React.CSSProperties = { marginBottom: 32 }

export default function PrivacyPage() {
  const { lang } = useLanguage()
  const l = getLegal(lang).privacy

  return (
    <main style={S}>
      <h1 style={{ color: '#fff', marginBottom: 8 }}>{l.title}</h1>
      <p style={{ color: '#888', marginBottom: 40 }}>{l.updated}</p>

      <section style={SEC}>
        <h2 style={H2}>{l.op.h}</h2>
        <p>{l.op.p.replace('info@docthink.app', '')}
          <a href="mailto:info@docthink.app" style={LINK}>info@docthink.app</a>
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.data.h}</h2>
        <ul>
          {l.data.items.map((item, i) => (
            <li key={i}><strong>{item.lb}</strong> — {item.tx}</li>
          ))}
        </ul>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.purpose.h}</h2>
        <ul>{l.purpose.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.third.h}</h2>
        <ul>
          {l.third.items.map((item, i) => (
            <li key={i}>
              <strong>{item.nm}</strong> — {item.dc} (<a href={item.url} style={LINK}>{item.url.replace('https://', '').replace('/privacy', '')}/privacy</a>)
            </li>
          ))}
        </ul>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.cookies.h}</h2>
        <p>{l.cookies.p}</p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.rights.h}</h2>
        <p>
          {l.rights.p.split('info@docthink.app')[0]}
          <a href="mailto:info@docthink.app" style={LINK}>info@docthink.app</a>
          {l.rights.p.split('info@docthink.app')[1]}
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>{l.security.h}</h2>
        <p>{l.security.p}</p>
      </section>

      <section>
        <h2 style={H2}>{l.contact.h}</h2>
        <p>
          {l.contact.p.split('info@docthink.app')[0]}
          <a href="mailto:info@docthink.app" style={LINK}>info@docthink.app</a>
        </p>
      </section>
    </main>
  )
}

'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { getFeedback } from '@/lib/i18n-legal'

export default function FeedbackPage() {
  const { lang } = useLanguage()
  const l = getFeedback(lang)

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to send.')
      }
      setStatus('sent')
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  const s: Record<string, React.CSSProperties> = {
    page: { maxWidth: 560, margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif', color: '#e0e0e0', background: '#07070d', minHeight: '100vh' },
    h1: { color: '#fff', marginBottom: 8, fontSize: 28 },
    sub: { color: '#888', marginBottom: 40, display: 'block' },
    label: { display: 'block', marginBottom: 6, color: '#aaa', fontSize: 14 },
    input: { width: '100%', padding: '12px 14px', background: '#13131f', border: '1px solid #2a2a3d', borderRadius: 8, color: '#fff', fontSize: 16, marginBottom: 20, boxSizing: 'border-box' as const },
    textarea: { width: '100%', padding: '12px 14px', background: '#13131f', border: '1px solid #2a2a3d', borderRadius: 8, color: '#fff', fontSize: 16, marginBottom: 24, boxSizing: 'border-box' as const, minHeight: 140, resize: 'vertical' as const },
    btn: { width: '100%', padding: '14px', background: '#7F77DD', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' },
    errorBox: { background: '#1a0a0a', border: '1px solid #7f2020', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#f87171', fontSize: 14 },
    success: { textAlign: 'center' as const, padding: '48px 0' },
  }

  if (status === 'sent') return (
    <main style={s.page}>
      <div style={s.success}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <h2 style={{ color: '#fff' }}>{l.successTitle}</h2>
        <p style={{ color: '#888', marginTop: 8 }}>{l.successSub} {form.email}</p>
        <a href="/" style={{ display: 'inline-block', marginTop: 32, color: '#7F77DD', textDecoration: 'none' }}>{l.back}</a>
      </div>
    </main>
  )

  return (
    <main style={s.page}>
      <h1 style={s.h1}>{l.title}</h1>
      <span style={s.sub}>{l.sub}</span>
      {status === 'error' && <div style={s.errorBox}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label style={s.label}>{l.nameLabel}</label>
        <input style={s.input} required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={l.namePlaceholder} disabled={status === 'sending'} />
        <label style={s.label}>{l.emailLabel}</label>
        <input style={s.input} type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder={l.emailPlaceholder} disabled={status === 'sending'} />
        <label style={s.label}>{l.messageLabel}</label>
        <textarea style={s.textarea} required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder={l.messagePlaceholder} disabled={status === 'sending'} />
        <button
          style={{ ...s.btn, ...(status === 'sending' ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
          type="submit"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? l.sendingBtn : l.sendBtn}
        </button>
      </form>
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #222', textAlign: 'center' }}>
        <a href="/" style={{ color: '#555', textDecoration: 'none', fontSize: 14 }}>{l.back}</a>
      </div>
    </main>
  )
}

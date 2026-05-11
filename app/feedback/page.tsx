'use client'

import type { Metadata } from 'next'
import { useState } from 'react'

export default function FeedbackPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      await fetch(`mailto:info@docthink.app?subject=Feedback from ${encodeURIComponent(form.name)}&body=${encodeURIComponent(form.message + '\n\nFrom: ' + form.email)}`)
      window.location.href = `mailto:info@docthink.app?subject=Feedback%20from%20${encodeURIComponent(form.name)}&body=${encodeURIComponent(form.message + '\n\nFrom: ' + form.email)}`
      setStatus('sent')
    } catch {
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
    success: { textAlign: 'center' as const, padding: '48px 0' },
  }

  if (status === 'sent') return (
    <main style={s.page}>
      <div style={s.success}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <h2 style={{ color: '#fff' }}>Thanks for your feedback!</h2>
        <p style={{ color: '#888' }}>We'll get back to you at {form.email}</p>
      </div>
    </main>
  )

  return (
    <main style={s.page}>
      <h1 style={s.h1}>Feedback</h1>
      <span style={s.sub}>Help us improve DocThink — report a bug or share an idea.</span>
      <form onSubmit={handleSubmit}>
        <label style={s.label}>Name</label>
        <input style={s.input} required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
        <label style={s.label}>Email</label>
        <input style={s.input} type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" />
        <label style={s.label}>Message</label>
        <textarea style={s.textarea} required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us what's on your mind..." />
        <button style={s.btn} type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send feedback'}
        </button>
      </form>
    </main>
  )
}

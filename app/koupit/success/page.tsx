'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import styles from './page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { getDGT } from '@/lib/i18n-dg'

function SuccessContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { lang } = useLanguage()
  const dg = getDGT(lang)
  const credits = parseInt(params.get('credits') || '0')
  const sessionId = params.get('session_id') || ''
  const [total, setTotal] = useState<number | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionId || credits <= 0) { setReady(true); return }

    let attempts = 0
    const MAX = 12

    async function tryVerify() {
      attempts++
      try {
        const res = await fetch('/api/stripe/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        const d = await res.json()

        if (res.ok && d.credits !== undefined) {
          setTotal(d.credits)
          setReady(true)
          return
        }

        if (res.status === 402 && attempts < MAX) {
          setTimeout(tryVerify, 2000)
          return
        }

        setError(d.error || 'Verification failed')
        setReady(true)
      } catch {
        if (attempts < MAX) {
          setTimeout(tryVerify, 2000)
        } else {
          setError('Network error')
          setReady(true)
        }
      }
    }

    tryVerify()
  }, [sessionId, credits])

  const isError = !!error

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.icon}>{isError ? '⚠️' : ready ? '✅' : '⏳'}</div>
        <h1 className={styles.title}>
          {!ready
            ? (lang === 'cs' ? 'Zpracovávám platbu…' : lang === 'de' ? 'Zahlung wird verarbeitet…' : 'Processing payment…')
            : isError
              ? (lang === 'cs' ? 'Platba proběhla, ale…' : lang === 'de' ? 'Zahlung erhalten, aber…' : 'Payment received, but…')
              : (lang === 'cs' ? 'Platba proběhla úspěšně!' : lang === 'de' ? 'Zahlung erfolgreich!' : 'Payment successful!')}
        </h1>
        <p className={styles.sub}>
          {!ready
            ? (lang === 'cs' ? 'Ověřujeme platbu, chvilku strpení…' : lang === 'de' ? 'Zahlung wird überprüft…' : 'Verifying payment, please wait…')
            : isError
              ? (lang === 'cs'
                  ? 'Platba byla přijata, ale kredity se nepodařilo automaticky přidat. Kontaktujte podporu s číslem objednávky.'
                  : lang === 'de'
                    ? 'Zahlung erhalten, aber Credits konnten nicht automatisch hinzugefügt werden. Kontaktieren Sie den Support.'
                    : 'Payment received but credits could not be added automatically. Please contact support with your order number.')
              : (
                <>
                  {lang === 'cs' ? `Bylo ti připsáno ` : lang === 'de' ? `Es wurden ` : `You received `}
                  <strong>{credits} {lang === 'cs' ? 'kreditů' : 'credits'}</strong>
                  {lang === 'de' ? ` gutgeschrieben` : ''}.
                  {total !== null && (
                    <> {lang === 'cs' ? `Celkem máš nyní` : lang === 'de' ? `Gesamtguthaben:` : `Total balance:`} <strong>{total} {lang === 'cs' ? 'kreditů' : 'credits'}</strong>.</>
                  )}
                </>
              )}
        </p>
        <button
          className={styles.btn}
          onClick={() => router.push('/')}
          disabled={!ready}
        >
          {lang === 'cs' ? 'Zpět do DocThink →' : lang === 'de' ? 'Zurück zu DocThink →' : 'Back to DocThink →'}
        </button>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        …
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}

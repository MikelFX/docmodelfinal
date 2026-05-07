'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import styles from './page.module.css'

function SuccessContent() {
  const params = useSearchParams()
  const router = useRouter()
  const credits = parseInt(params.get('credits') || '0')
  const sessionId = params.get('session_id') || ''
  const [total, setTotal] = useState<number | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionId || credits <= 0) { setReady(true); return }

    let attempts = 0
    const MAX = 12 // 24s total

    async function tryVerify() {
      attempts++
      try {
        // First try: call verify endpoint (works even if webhook didn't fire)
        const res = await fetch('/api/stripe/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        const d = await res.json()

        if (res.ok && d.credits !== undefined) {
          localStorage.setItem('docthink_credits', d.credits.toString())
          setTotal(d.credits)
          setReady(true)
          return
        }

        // 402 = Stripe says not paid yet (rare), retry
        if (res.status === 402 && attempts < MAX) {
          setTimeout(tryVerify, 2000)
          return
        }

        // Any other error or max attempts — still let user proceed
        console.error('[success] verify failed:', d.error)
        setError(d.error || 'Verification failed')
        setReady(true)
      } catch (err) {
        if (attempts < MAX) {
          setTimeout(tryVerify, 2000)
        } else {
          setError('Network error — please contact support.')
          setReady(true)
        }
      }
    }

    tryVerify()
  }, [sessionId, credits])

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.icon}>{error ? '⚠️' : '✅'}</div>
        <h1 className={styles.title}>
          {error ? 'Platba proběhla, ale…' : 'Platba proběhla úspěšně!'}
        </h1>
        <p className={styles.sub}>
          {ready ? (
            error ? (
              <>
                Platba byla přijata, ale kredity se nepodařilo automaticky přidat.
                Napiš nám na support s číslem objednávky a kredity přidáme ručně.
                <br /><small style={{ color: '#666', fontSize: 11 }}>{error}</small>
              </>
            ) : (
              <>
                Bylo ti připsáno <strong>{credits} kreditů</strong>.
                {total !== null && <> Celkem máš nyní <strong>{total} kreditů</strong>.</>}
              </>
            )
          ) : (
            'Zpracovávám platbu…'
          )}
        </p>
        <button className={styles.btn} onClick={() => router.push('/app')} disabled={!ready}>
          Zpět do DocThink →
        </button>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        Načítám...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}

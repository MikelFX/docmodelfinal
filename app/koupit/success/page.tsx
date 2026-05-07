'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import styles from './page.module.css'

function SuccessContent() {
  const params = useSearchParams()
  const router = useRouter()
  const credits = parseInt(params.get('credits') || '0')
  const [total, setTotal] = useState<number | null>(null)
  const [ready, setReady] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startCreditsRef = useRef<number | null>(null)

  useEffect(() => {
    if (credits <= 0) { setReady(true); return }

    // Zjisti aktuální stav kreditů před pollováním
    fetch('/api/credits')
      .then(r => r.json())
      .then(d => {
        if (d.credits !== undefined) {
          startCreditsRef.current = d.credits
          localStorage.setItem('docthink_credits', d.credits.toString())
        }
      })

    // Polluj dokud Stripe webhook nepřipíše kredity (max 30s)
    let attempts = 0
    pollRef.current = setInterval(async () => {
      attempts++
      try {
        const res = await fetch('/api/credits')
        const d = await res.json()
        if (d.credits !== undefined) {
          const start = startCreditsRef.current ?? 0
          if (d.credits > start || attempts >= 15) {
            clearInterval(pollRef.current!)
            setTotal(d.credits)
            localStorage.setItem('docthink_credits', d.credits.toString())
            setReady(true)
          }
        }
      } catch { /* ignoruj */ }
    }, 2000)

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [credits])

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.icon}>✅</div>
        <h1 className={styles.title}>Platba proběhla úspěšně!</h1>
        <p className={styles.sub}>
          {ready ? (
            <>
              Bylo ti připsáno <strong>{credits} kreditů</strong>.
              {total !== null && <> Celkem máš nyní <strong>{total} kreditů</strong>.</>}
            </>
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

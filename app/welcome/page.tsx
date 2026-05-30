'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function WelcomePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [credits, setCredits] = useState<number | null>(null)
  const [referralApplied, setReferralApplied] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [origin, setOrigin] = useState('')

  useEffect(() => { setOrigin(window.location.origin) }, [])

  // Apply referral from cookie set by /r/[code]
  useEffect(() => {
    if (!isLoaded || !user) return
    const match = document.cookie.match(/(?:^|;\s*)dtref=([^;]+)/)
    const refCode = match?.[1]
    if (!refCode) return
    document.cookie = 'dtref=; max-age=0; path=/'
    if (refCode === user.id.slice(5)) return // self-referral guard
    fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refCode }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setReferralApplied(true)
          if (typeof d.credits === 'number') setCredits(d.credits)
        }
      })
      .catch(() => {})
  }, [isLoaded, user])

  useEffect(() => {
    if (!isLoaded || !user) return
    fetch('/api/credits')
      .then(r => r.json())
      .then(d => { if (typeof d.credits === 'number') setCredits(prev => prev ?? d.credits) })
      .catch(() => {})
  }, [isLoaded, user])

  const referralLink = origin && user ? `${origin}/r/${user.id.slice(5)}` : ''

  const handleCopy = async () => {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2200)
    } catch {}
  }

  if (!isLoaded) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.shield}>🛡️</div>
        <h1 className={styles.title}>
          {user?.firstName ? `Vítej, ${user.firstName}!` : 'Vítej v DocThink!'}
        </h1>
        <p className={styles.sub}>Tvůj účet je připraven. Začni chránit své smlouvy.</p>

        {credits !== null && (
          <div className={styles.creditsBox}>
            <span className={styles.creditsNum}>{credits}</span>
            <span className={styles.creditsLabel}>kreditů k dispozici</span>
          </div>
        )}

        {referralApplied && (
          <div className={styles.bonus}>🎁 +2 bonusové kredity za pozvánku přičteny!</div>
        )}

        <div className={styles.referral}>
          <p className={styles.referralTitle}>Pozvi přítele — oba dostanete 2 kredity zdarma</p>
          {referralLink && (
            <div className={styles.referralRow}>
              <span className={styles.referralUrl}>{referralLink}</span>
              <button
                className={`${styles.copyBtn} ${copyState === 'copied' ? styles.copied : ''}`}
                onClick={handleCopy}
              >
                {copyState === 'copied' ? '✓ Zkopírováno' : 'Kopírovat'}
              </button>
            </div>
          )}
        </div>

        <button className={styles.cta} onClick={() => router.push('/app')}>
          Začít analyzovat →
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { LangKey } from '@/lib/i18n'
import styles from './LanguageSwitcher.module.css'

const LANGS: { code: LangKey; flag: string; label: string }[] = [
  { code: 'cs', flag: '🇨🇿', label: 'Čeština' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'sk', flag: '🇸🇰', label: 'Slovenčina' },
]

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = LANGS.find(l => l.code === lang) ?? LANGS[0]

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className={styles.wrap} ref={ref}>
      {open && (
        <div className={styles.menu}>
          {LANGS.map(l => (
            <button
              key={l.code}
              className={`${styles.option} ${l.code === lang ? styles.optionActive : ''}`}
              onClick={() => { setLang(l.code); setOpen(false) }}
            >
              <span className={styles.optionFlag}>{l.flag}</span>
              <span className={styles.optionLabel}>{l.label}</span>
              {l.code === lang && <span className={styles.optionCheck}>✓</span>}
            </button>
          ))}
        </div>
      )}
      <button className={styles.trigger} onClick={() => setOpen(o => !o)} aria-label="Change language">
        <span className={styles.flag}>{current.flag}</span>
        <span className={styles.code}>{current.code.toUpperCase()}</span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          width="10" height="10" viewBox="0 0 10 10" fill="none"
        >
          <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}

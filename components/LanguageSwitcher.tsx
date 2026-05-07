'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { LangKey } from '@/lib/i18n'
import styles from './LanguageSwitcher.module.css'

const FULL_UI: { code: LangKey; flag: string; label: string }[] = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'cs', flag: '🇨🇿', label: 'Čeština' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'sk', flag: '🇸🇰', label: 'Slovenčina' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'it', flag: '🇮🇹', label: 'Italiano' },
  { code: 'pl', flag: '🇵🇱', label: 'Polski' },
  { code: 'nl', flag: '🇳🇱', label: 'Nederlands' },
  { code: 'pt', flag: '🇵🇹', label: 'Português' },
]

const MORE_EU: { code: LangKey; flag: string; label: string }[] = [
  { code: 'ro', flag: '🇷🇴', label: 'Română' },
  { code: 'hu', flag: '🇭🇺', label: 'Magyar' },
  { code: 'sv', flag: '🇸🇪', label: 'Svenska' },
  { code: 'da', flag: '🇩🇰', label: 'Dansk' },
  { code: 'fi', flag: '🇫🇮', label: 'Suomi' },
  { code: 'el', flag: '🇬🇷', label: 'Ελληνικά' },
  { code: 'hr', flag: '🇭🇷', label: 'Hrvatski' },
  { code: 'bg', flag: '🇧🇬', label: 'Български' },
  { code: 'sl', flag: '🇸🇮', label: 'Slovenščina' },
  { code: 'et', flag: '🇪🇪', label: 'Eesti' },
  { code: 'lv', flag: '🇱🇻', label: 'Latviešu' },
  { code: 'lt', flag: '🇱🇹', label: 'Lietuvių' },
  { code: 'mt', flag: '🇲🇹', label: 'Malti' },
  { code: 'ga', flag: '🇮🇪', label: 'Gaeilge' },
]

const ALL_LANGS = [...FULL_UI, ...MORE_EU]

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = ALL_LANGS.find(l => l.code === lang) ?? FULL_UI[0]

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
          <div className={styles.menuSection}>Full UI</div>
          {FULL_UI.map(l => (
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
          <div className={styles.menuDivider} />
          <div className={styles.menuSection}>More EU (EN UI)</div>
          {MORE_EU.map(l => (
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

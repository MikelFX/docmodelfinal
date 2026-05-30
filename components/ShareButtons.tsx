'use client'

import { useState } from 'react'
import styles from './ShareButtons.module.css'
import { exportPDF } from '@/lib/exportPDF'
import { getAnalysisSummaryText, Analysis } from '@/lib/analysisUtils'

interface Props {
  analysis: Analysis
  docName?: string
  onSave?: () => Promise<void>
  onShareLink?: () => Promise<string | null>
}

export default function ShareButtons({ analysis, docName, onSave, onShareLink }: Props) {
  const [pdfState, setPdfState] = useState<'idle' | 'generating'>('idle')
  const [pdfMsg, setPdfMsg] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'saving'>('idle')
  const [linkState, setLinkState] = useState<'idle' | 'loading' | 'copied'>('idle')

  const summaryText = getAnalysisSummaryText(analysis, docName)
  const encodedText = encodeURIComponent(summaryText)

  const handleExportPDF = async () => {
    if (pdfState === 'generating') return
    setPdfState('generating')
    setPdfMsg('Preparing PDF...')
    try {
      await exportPDF(analysis, docName, setPdfMsg)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setPdfState('idle')
      setPdfMsg('')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'DocThink Contract Analysis', text: summaryText })
      } catch {}
    } else {
      handleCopy()
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2200)
    } catch {}
  }

  const handleShareLink = async () => {
    if (!onShareLink || linkState !== 'idle') return
    setLinkState('loading')
    try {
      const url = await onShareLink()
      if (url) {
        await navigator.clipboard.writeText(url).catch(() => {})
        setLinkState('copied')
        setTimeout(() => setLinkState('idle'), 2200)
      } else {
        setLinkState('idle')
      }
    } catch {
      setLinkState('idle')
    }
  }

  const handleSave = async () => {
    if (saveState !== 'idle' || !onSave) return
    setSaveState('saving')
    try {
      await onSave()
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2200)
    } catch {
      setSaveState('idle')
    }
  }

  return (
    <div className={styles.wrap}>
      {pdfState === 'generating' && (
        <div className={styles.progress}>
          <div className={styles.spinner} />
          <span>{pdfMsg || 'Generating PDF...'}</span>
        </div>
      )}

      <div className={styles.mainRow}>
        <button
          className={styles.btn}
          onClick={handleExportPDF}
          disabled={pdfState === 'generating'}
        >
          <span className={styles.icon}>📄</span>
          <span>Export PDF</span>
        </button>

        <button className={styles.btn} onClick={handleShare}>
          <span className={styles.icon}>↗</span>
          <span>Share</span>
        </button>

        {onShareLink && (
          <button
            className={`${styles.btn} ${linkState === 'copied' ? styles.btnSuccess : ''}`}
            onClick={handleShareLink}
            disabled={linkState === 'loading'}
          >
            <span className={styles.icon}>{linkState === 'copied' ? '✓' : linkState === 'loading' ? '⏳' : '🔗'}</span>
            <span>{linkState === 'copied' ? 'Zkopírováno!' : 'Link'}</span>
          </button>
        )}

        <button
          className={`${styles.btn} ${copyState === 'copied' ? styles.btnSuccess : ''}`}
          onClick={handleCopy}
        >
          <span className={styles.icon}>{copyState === 'copied' ? '✓' : '📋'}</span>
          <span>{copyState === 'copied' ? 'Copied!' : 'Copy'}</span>
        </button>

        {onSave && (
          <button
            className={`${styles.btn} ${saveState === 'saved' ? styles.btnSuccess : ''}`}
            onClick={handleSave}
            disabled={saveState === 'saving'}
          >
            <span className={styles.icon}>
              {saveState === 'saved' ? '✓' : saveState === 'saving' ? '⏳' : '💾'}
            </span>
            <span>{saveState === 'saved' ? 'Saved!' : 'Save'}</span>
          </button>
        )}
      </div>

      <div className={styles.chipsRow}>
        <a
          href={`https://wa.me/?text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.chip} ${styles.chipWa}`}
        >
          WhatsApp
        </a>
        <a
          href={`mailto:?subject=Contract%20Analysis%20%E2%80%94%20DocThink&body=${encodedText}`}
          className={`${styles.chip} ${styles.chipEmail}`}
        >
          Email
        </a>
        <a
          href={`https://t.me/share/url?url=https%3A%2F%2Fdocthink.ai&text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.chip} ${styles.chipTg}`}
        >
          Telegram
        </a>
      </div>
    </div>
  )
}

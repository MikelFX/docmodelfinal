'use client'

import { useState, useEffect, useRef, useCallback, TouchEvent } from 'react'
import styles from './HistoryScreen.module.css'
import { getHistory, deleteFromHistory, getStorageEstimate, HistoryEntry } from '@/lib/analysisHistory'
import { getAnalysisSummaryText, VERDICT_EMOJI } from '@/lib/analysisUtils'
import ShareButtons from './ShareButtons'

const VERDICT_COLOR: Record<string, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
}

interface Props {
  onBack: () => void
}

type View = 'list' | 'detail'

interface SwipeState {
  startX: number
  deltaX: number
  id: string
}

export default function HistoryScreen({ onBack }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [storageMB, setStorageMB] = useState(0)
  const [view, setView] = useState<View>('list')
  const [selected, setSelected] = useState<HistoryEntry | null>(null)
  const [swipe, setSwipe] = useState<SwipeState | null>(null)
  const [revealedId, setRevealedId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [contextEntry, setContextEntry] = useState<HistoryEntry | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const [data, storage] = await Promise.all([getHistory(), getStorageEstimate()])
      setEntries(data)
      setStorageMB(storage.usageMB)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    await deleteFromHistory(id)
    setEntries(prev => prev.filter(e => e.id !== id))
    setRevealedId(null)
    setConfirmDeleteId(null)
    if (selected?.id === id) { setSelected(null); setView('list') }
  }

  const onTouchStart = useCallback((e: TouchEvent<HTMLDivElement>, id: string) => {
    const t = e.touches[0]
    setSwipe({ startX: t.clientX, deltaX: 0, id })
    setRevealedId(prev => (prev !== id ? null : prev))

    // Long press
    longPressTimer.current = setTimeout(() => {
      const entry = entries.find(e => e.id === id)
      if (entry) setContextEntry(entry)
    }, 580)
  }, [entries])

  const onTouchMove = useCallback((e: TouchEvent<HTMLDivElement>, id: string) => {
    if (!swipe || swipe.id !== id) return
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
    const deltaX = e.touches[0].clientX - swipe.startX
    if (deltaX > 0) return // only left swipe
    setSwipe(prev => prev ? { ...prev, deltaX } : prev)
  }, [swipe])

  const onTouchEnd = useCallback((id: string) => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
    if (!swipe || swipe.id !== id) return
    if (swipe.deltaX < -60) {
      setRevealedId(id)
    } else {
      setRevealedId(prev => (prev === id ? null : prev))
    }
    setSwipe(null)
  }, [swipe])

  const openDetail = (entry: HistoryEntry) => {
    setSelected(entry)
    setView('detail')
  }

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }

  if (view === 'detail' && selected) {
    const analysis = {
      verdict: selected.verdict,
      verdictCZ: selected.verdictCZ,
      verdictColor: selected.verdictColor,
      summary: selected.summary,
      risks: selected.risks,
      missing: selected.missing,
      recommendation: selected.recommendation,
    }

    return (
      <div className={styles.screen}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => { setView('list'); setSelected(null) }}>
            ← Back
          </button>
          <span className={styles.topBarTitle}>{selected.documentName}</span>
          <div style={{ width: 56 }} />
        </div>

        <div className={styles.detailBody}>
          <div className={styles.verdictSection}>
            <div
              className={styles.verdictCircle}
              style={{ borderColor: `${VERDICT_COLOR[selected.verdictColor]}66`, boxShadow: `0 0 40px ${VERDICT_COLOR[selected.verdictColor]}33` }}
            >
              {VERDICT_EMOJI[selected.verdict] ?? '📄'}
            </div>
            <div className={styles.verdictLabel} style={{ color: VERDICT_COLOR[selected.verdictColor] }}>
              {selected.verdictCZ}
            </div>
            <div className={styles.riskScore}>Risk Score: {selected.riskScore}/10</div>
            <p className={styles.summary}>{selected.summary}</p>
          </div>

          {selected.recommendation && (
            <div className={styles.card}>
              <p className={styles.cardLabel}>Recommendation</p>
              <p className={styles.cardText}>{selected.recommendation}</p>
            </div>
          )}

          {selected.risks.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Risks ({selected.risks.length})</p>
              {selected.risks.map((r, i) => (
                <div key={i} className={`${styles.riskItem} ${r.level === 'red' ? styles.riskRed : styles.riskYellow}`}>
                  <div className={`${styles.riskDot} ${r.level === 'red' ? styles.dotRed : styles.dotYellow}`} />
                  <div>
                    <p className={styles.riskTitle}>{r.title}</p>
                    <p className={styles.riskDesc}>{r.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selected.missing.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Missing Clauses</p>
              {selected.missing.map((m, i) => (
                <div key={i} className={styles.missingItem}>
                  <span className={styles.missingDot}>○</span>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.shareWrap}>
            <ShareButtons analysis={analysis} docName={selected.documentName} />
          </div>

          <button className={styles.deleteBtn} onClick={() => setConfirmDeleteId(selected.id)}>
            Delete from History
          </button>

          <div style={{ height: 32 }} />
        </div>

        {confirmDeleteId && (
          <div className={styles.confirmOverlay} onClick={() => setConfirmDeleteId(null)}>
            <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
              <p className={styles.confirmTitle}>Delete this analysis?</p>
              <p className={styles.confirmSub}>This cannot be undone.</p>
              <button className={styles.confirmDel} onClick={() => handleDelete(confirmDeleteId)}>Delete</button>
              <button className={styles.confirmCancel} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.screen}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <span className={styles.topBarTitle}>History</span>
        <div style={{ width: 56 }} />
      </div>

      {loading ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⏳</div>
          <p>Loading...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📂</div>
          <p className={styles.emptyText}>No analyses yet</p>
          <p className={styles.emptyHint}>Analyzed contracts will appear here</p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {entries.map(entry => {
              const isRevealed = revealedId === entry.id
              const swipeDelta = swipe?.id === entry.id ? Math.max(swipe.deltaX, -90) : 0
              const translateX = isRevealed ? -80 : swipeDelta

              return (
                <div key={entry.id} className={styles.itemWrap}>
                  <div
                    className={styles.item}
                    style={{ transform: `translateX(${translateX}px)`, transition: swipe?.id === entry.id ? 'none' : 'transform 0.2s ease' }}
                    onTouchStart={e => onTouchStart(e, entry.id)}
                    onTouchMove={e => onTouchMove(e, entry.id)}
                    onTouchEnd={() => onTouchEnd(entry.id)}
                    onClick={() => { if (!isRevealed) openDetail(entry) }}
                  >
                    <div className={styles.thumb}>
                      {entry.thumbnailBase64
                        ? <img src={`data:image/jpeg;base64,${entry.thumbnailBase64}`} alt="" className={styles.thumbImg} />
                        : <span className={styles.thumbPlaceholder}>📄</span>
                      }
                    </div>
                    <div className={styles.itemContent}>
                      <p className={styles.itemName} title={entry.documentName}>{entry.documentName}</p>
                      <div className={styles.itemMeta}>
                        <span
                          className={styles.verdictBadge}
                          style={{ color: VERDICT_COLOR[entry.verdictColor], borderColor: `${VERDICT_COLOR[entry.verdictColor]}44`, background: `${VERDICT_COLOR[entry.verdictColor]}11` }}
                        >
                          {VERDICT_EMOJI[entry.verdict]} {entry.verdictCZ}
                        </span>
                        <span className={styles.itemScore}>{entry.riskScore}/10</span>
                      </div>
                      <p className={styles.itemDate}>{formatDate(entry.analyzedAt)} · {formatTime(entry.analyzedAt)}</p>
                    </div>
                    <div className={styles.itemChevron}>›</div>
                  </div>

                  {/* Swipe-revealed delete */}
                  <button
                    className={styles.swipeDelete}
                    style={{ opacity: isRevealed || (swipe?.id === entry.id && swipe.deltaX < -30) ? 1 : 0 }}
                    onClick={e => { e.stopPropagation(); setConfirmDeleteId(entry.id) }}
                  >
                    Delete
                  </button>
                </div>
              )
            })}
          </div>

          {storageMB > 0 && (
            <p className={styles.storageInfo}>Using {storageMB} MB of local storage</p>
          )}
        </>
      )}

      {/* Long-press context menu */}
      {contextEntry && (
        <div className={styles.contextOverlay} onClick={() => setContextEntry(null)}>
          <div className={styles.contextSheet} onClick={e => e.stopPropagation()}>
            <p className={styles.contextName}>{contextEntry.documentName}</p>
            <button
              className={styles.contextBtn}
              onClick={async () => {
                const text = getAnalysisSummaryText(
                  { verdict: contextEntry.verdict, verdictCZ: contextEntry.verdictCZ, verdictColor: contextEntry.verdictColor, summary: contextEntry.summary, risks: contextEntry.risks, missing: contextEntry.missing, recommendation: contextEntry.recommendation },
                  contextEntry.documentName
                )
                if (navigator.share) {
                  try { await navigator.share({ title: 'DocThink Analysis', text }) } catch {}
                } else {
                  await navigator.clipboard.writeText(text)
                }
                setContextEntry(null)
              }}
            >
              ↗ Share
            </button>
            <button
              className={styles.contextBtn}
              onClick={() => { openDetail(contextEntry); setContextEntry(null) }}
            >
              👁 View Analysis
            </button>
            <button
              className={`${styles.contextBtn} ${styles.contextBtnDanger}`}
              onClick={() => { setConfirmDeleteId(contextEntry.id); setContextEntry(null) }}
            >
              🗑 Delete
            </button>
            <button className={styles.contextCancel} onClick={() => setContextEntry(null)}>Cancel</button>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className={styles.confirmOverlay} onClick={() => setConfirmDeleteId(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <p className={styles.confirmTitle}>Delete this analysis?</p>
            <p className={styles.confirmSub}>This cannot be undone.</p>
            <button className={styles.confirmDel} onClick={() => handleDelete(confirmDeleteId)}>Delete</button>
            <button className={styles.confirmCancel} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

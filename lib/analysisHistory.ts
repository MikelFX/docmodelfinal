'use client'

import { Analysis, computeRiskScore } from './analysisUtils'

export interface HistoryEntry {
  id: string
  documentName: string
  thumbnailBase64: string
  verdict: 'sign' | 'modify' | 'reject'
  verdictColor: 'green' | 'yellow' | 'red'
  verdictCZ: string
  riskScore: number
  risks: { level: 'red' | 'yellow'; title: string; description: string }[]
  summary: string
  recommendation: string
  missing: string[]
  analyzedAt: number
  language: string
}

const DB_NAME = 'docthink'
const STORE = 'history'
const VERSION = 1
const MAX = 50

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: 'id' })
        s.createIndex('analyzedAt', 'analyzedAt')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveToHistory(
  analysis: Analysis,
  opts: { documentName: string; thumbnailBase64: string; language: string }
): Promise<void> {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    documentName: opts.documentName,
    thumbnailBase64: opts.thumbnailBase64,
    verdict: analysis.verdict,
    verdictColor: analysis.verdictColor,
    verdictCZ: analysis.verdictCZ,
    riskScore: computeRiskScore(analysis),
    risks: analysis.risks,
    summary: analysis.summary,
    recommendation: analysis.recommendation,
    missing: analysis.missing,
    analyzedAt: Date.now(),
    language: opts.language,
  }

  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)

    // Evict oldest if at limit
    const countReq = store.count()
    countReq.onsuccess = () => {
      if (countReq.result >= MAX) {
        const cursor = store.index('analyzedAt').openCursor(null, 'next')
        cursor.onsuccess = (e) => {
          const c = (e.target as IDBRequest<IDBCursorWithValue | null>).result
          if (c) store.delete(c.primaryKey)
        }
      }
    }

    store.put(entry)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).index('analyzedAt').getAll()
    req.onsuccess = () => { db.close(); resolve((req.result as HistoryEntry[]).reverse()) }
    req.onerror = () => { db.close(); reject(req.error) }
  })
}

export async function deleteFromHistory(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function getStorageEstimate(): Promise<{ usageMB: number; quotaMB: number }> {
  if (!navigator.storage?.estimate) return { usageMB: 0, quotaMB: 0 }
  const est = await navigator.storage.estimate()
  return {
    usageMB: Math.round(((est.usage ?? 0) / 1024 / 1024) * 10) / 10,
    quotaMB: Math.round(((est.quota ?? 0) / 1024 / 1024) * 10) / 10,
  }
}

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './DocGuard.module.css'

type Screen = 'home' | 'analyzing' | 'result'
type Verdict = 'sign' | 'modify' | 'reject'

interface Risk {
  level: 'red' | 'yellow'
  title: string
  description: string
}

interface Analysis {
  verdict: Verdict
  verdictCZ: string
  verdictColor: 'green' | 'yellow' | 'red'
  summary: string
  risks: Risk[]
  missing: string[]
  recommendation: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

const VERDICT_EMOJI: Record<Verdict, string> = {
  sign: '✅',
  modify: '⚠️',
  reject: '🚫',
}

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let text = ''
  for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item: any) => item.str).join(' ') + '\n'
  }
  return text
}

async function extractTextFromFile(file: File): Promise<{ text?: string; imageBase64?: string; imageType?: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext ?? '')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        const [header, data] = dataUrl.split(',')
        const mediaType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
        resolve({ imageBase64: data, imageType: mediaType })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  if (file.type === 'application/pdf' || ext === 'pdf') {
    const text = await extractTextFromPDF(file)
    return { text }
  }

  // TXT, DOCX fallback — read as text
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve({ text: e.target?.result as string })
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export default function DocGuard() {
  const [screen, setScreen] = useState<Screen>('home')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [docContent, setDocContent] = useState<string>('')
  const [docImageBase64, setDocImageBase64] = useState<string>('')
  const [docImageType, setDocImageType] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [analyzeStep, setAnalyzeStep] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  useEffect(() => {
    if (screen !== 'analyzing') return
    const steps = [0, 1, 2]
    const timers = steps.map((s) =>
      setTimeout(() => setAnalyzeStep(s), s * 900)
    )
    return () => timers.forEach(clearTimeout)
  }, [screen])

  const analyze = useCallback(async (
    text?: string,
    imageBase64?: string,
    imageType?: string
  ) => {
    setScreen('analyzing')
    setAnalyzeStep(0)
    setError('')
    setChatMessages([])

    try {
      const body: any = {}
      if (text) body.content = text
      if (imageBase64) { body.imageBase64 = imageBase64; body.imageType = imageType }

      const res = await fetch('/api/docguard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Analýza selhala. Zkuste znovu.')
        setScreen('home')
        return
      }

      setAnalysis(data)
      setScreen('result')
    } catch (err: any) {
      setError(err.message ?? 'Síťová chyba. Zkontrolujte připojení.')
      setScreen('home')
    }
  }, [])

  const handleFile = useCallback(async (file: File) => {
    if (!file) return
    setError('')

    try {
      const result = await extractTextFromFile(file)

      if (result.imageBase64) {
        setDocContent('')
        setDocImageBase64(result.imageBase64)
        setDocImageType(result.imageType ?? 'image/jpeg')
        await analyze(undefined, result.imageBase64, result.imageType)
      } else if (result.text) {
        const trimmed = result.text.trim()
        if (!trimmed) {
          setError('Soubor je prázdný nebo nelze přečíst.')
          return
        }
        setDocContent(trimmed)
        setDocImageBase64('')
        setDocImageType('')
        await analyze(trimmed)
      } else {
        setError('Nepodporovaný formát souboru.')
      }
    } catch (err: any) {
      setError(err.message ?? 'Chyba při čtení souboru.')
    }
  }, [analyze])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const sendChat = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return

    const userMsg = chatInput.trim()
    setChatInput('')
    setChatLoading(true)

    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: userMsg }]
    setChatMessages(newMessages)

    // Add streaming assistant message
    setChatMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    try {
      const history = newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/docguard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: docContent || undefined,
          imageBase64: docImageBase64 || undefined,
          imageType: docImageType || undefined,
          chatHistory: history,
          userMessage: userMsg,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setChatMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: data.error ?? 'Chyba odpovědi.' }
          return updated
        })
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setChatMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: accumulated, streaming: true }
          return updated
        })
      }

      setChatMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: accumulated, streaming: false }
        return updated
      })
    } catch (err: any) {
      setChatMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'Chyba připojení.' }
        return updated
      })
    } finally {
      setChatLoading(false)
    }
  }, [chatInput, chatLoading, chatMessages, docContent, docImageBase64, docImageType])

  const resetAll = useCallback(() => {
    setScreen('home')
    setAnalysis(null)
    setDocContent('')
    setDocImageBase64('')
    setDocImageType('')
    setError('')
    setChatMessages([])
    setChatInput('')
    setAnalyzeStep(0)
  }, [])

  const verdictColorClass = analysis ? {
    green: styles.verdictCircleGreen,
    yellow: styles.verdictCircleYellow,
    red: styles.verdictCircleRed,
  }[analysis.verdictColor] : ''

  const verdictLabelClass = analysis ? {
    green: styles.verdictLabelGreen,
    yellow: styles.verdictLabelYellow,
    red: styles.verdictLabelRed,
  }[analysis.verdictColor] : ''

  return (
    <div className={styles.app}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.docx,image/*"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
      />

      {/* ── HOME ── */}
      {screen === 'home' && (
        <div className={styles.homeScreen}>
          <div className={styles.homeHeader}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🛡️</span>
              <span className={styles.logoText}>DocGuard</span>
            </div>
            <p className={styles.tagline}>Chráním tě před špatnou smlouvou</p>
          </div>

          <div
            className={`${styles.uploadZone} ${isDragging ? styles.uploadZoneDrag : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={styles.uploadZoneOrb} />
            <div className={styles.uploadIcon}>📄</div>
            <p className={styles.uploadTitle}>Přetáhni sem dokument</p>
            <p className={styles.uploadSub}>nebo klikni pro výběr souboru</p>
            <div className={styles.uploadFormats}>
              {['PDF', 'DOCX', 'TXT', 'JPG', 'PNG'].map(f => (
                <span key={f} className={styles.formatBadge}>{f}</span>
              ))}
            </div>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className={styles.uploadActions}>
            <button
              className={styles.btnCamera}
              onClick={() => cameraInputRef.current?.click()}
            >
              📷 Vyfotit smlouvu
            </button>
            <button
              className={styles.btnUpload}
              onClick={() => fileInputRef.current?.click()}
            >
              📁 Nahrát soubor
            </button>
          </div>
        </div>
      )}

      {/* ── ANALYZING ── */}
      {screen === 'analyzing' && (
        <div className={styles.analyzingScreen}>
          <div className={styles.scannerWrap}>
            <div className={styles.shieldCircle}>
              <span className={styles.shieldIcon}>🛡️</span>
              <div className={styles.scanLineAnim} />
            </div>
            <div className={styles.orbitDot} />
            <div className={styles.orbitDot} />
            <div className={styles.orbitDot} />
          </div>

          <div className={styles.analyzingText}>
            <h2 className={styles.analyzingTitle}>Analyzuji dokument...</h2>
            <p className={styles.analyzingSubtitle}>Claude AI kontroluje každou klauzuli</p>
          </div>

          <div className={styles.analyzingSteps}>
            {[
              'Čtení a parsování dokumentu',
              'Identifikace rizikových klauzulí',
              'Generování doporučení',
            ].map((step, i) => (
              <div
                key={i}
                className={`${styles.stepItem} ${analyzeStep >= i ? styles.stepItemActive : ''}`}
              >
                <div className={styles.stepDot} />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RESULT ── */}
      {screen === 'result' && analysis && (
        <div className={styles.resultScreen}>
          {/* Top bar */}
          <div className={styles.resultTopBar}>
            <button className={styles.newAnalysisBtn} onClick={resetAll}>
              ← Nová
            </button>
            <span className={styles.topBarTitle}>Výsledek analýzy</span>
            <div style={{ width: 64 }} />
          </div>

          {/* Scrollable body */}
          <div className={styles.resultBody}>
            {/* Verdict */}
            <div className={styles.verdictSection}>
              <div className={`${styles.verdictCircle} ${verdictColorClass}`}>
                {VERDICT_EMOJI[analysis.verdict]}
              </div>
              <div className={`${styles.verdictLabel} ${verdictLabelClass}`}>
                {analysis.verdictCZ}
              </div>
              <p className={styles.verdictSummary}>{analysis.summary}</p>
            </div>

            {/* Recommendation */}
            {analysis.recommendation && (
              <div className={styles.recommendationCard}>
                <p className={styles.recommendationTitle}>💡 Doporučení</p>
                <p className={styles.recommendationText}>{analysis.recommendation}</p>
              </div>
            )}

            {/* Risks */}
            {analysis.risks.length > 0 && (
              <div className={styles.risksSection}>
                <p className={styles.sectionTitle}>Rizika ({analysis.risks.length})</p>
                {analysis.risks.map((risk, i) => (
                  <div
                    key={i}
                    className={`${styles.riskItem} ${risk.level === 'red' ? styles.riskItemRed : styles.riskItemYellow}`}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className={`${styles.riskDot} ${risk.level === 'red' ? styles.riskDotRed : styles.riskDotYellow}`} />
                    <div className={styles.riskContent}>
                      <p className={styles.riskTitle}>{risk.title}</p>
                      <p className={styles.riskDesc}>{risk.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Missing */}
            {analysis.missing.length > 0 && (
              <div className={styles.missingSection}>
                <p className={styles.sectionTitle}>Chybějící klauzule</p>
                {analysis.missing.map((item, i) => (
                  <div
                    key={i}
                    className={styles.missingItem}
                    style={{ animationDelay: `${(analysis.risks.length + i) * 0.08}s` }}
                  >
                    <span className={styles.missingIcon}>○</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ height: 8 }} />
          </div>

          {/* Chat section */}
          <div className={styles.chatSection}>
            {chatMessages.length > 0 && (
              <div className={styles.chatMessages}>
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`${styles.chatBubble} ${msg.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAssistant}`}
                  >
                    {msg.content}
                    {msg.streaming && <span className={styles.cursor} />}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
            <div className={styles.chatInputRow}>
              <input
                ref={chatInputRef}
                className={styles.chatInput}
                placeholder="Zeptej se na smlouvu..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }}
                disabled={chatLoading}
              />
              <button
                className={styles.chatSendBtn}
                onClick={sendChat}
                disabled={!chatInput.trim() || chatLoading}
              >
                {chatLoading ? '⏳' : '↑'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

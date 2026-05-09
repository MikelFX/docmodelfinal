'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import styles from './DocGuard.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { getDGT } from '@/lib/i18n-dg'

const FREE_LIMIT = 3
const FREE_KEY = 'docguard_free_uses'

function getFreeUses(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(FREE_KEY) ?? '0', 10)
}

function incrementFreeUses() {
  localStorage.setItem(FREE_KEY, (getFreeUses() + 1).toString())
}

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

async function resizeImage(file: File, maxWidth = 1600, quality = 0.82): Promise<{ imageBase64: string; imageType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      const [, data] = dataUrl.split(',')
      resolve({ imageBase64: data, imageType: 'image/jpeg' })
    }
    img.onerror = reject
    img.src = url
  })
}

async function extractTextFromFile(file: File): Promise<{ text?: string; imageBase64?: string; imageType?: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext ?? '')) {
    const resized = await resizeImage(file)
    return resized
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
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const { lang } = useLanguage()
  const dg = getDGT(lang)
  const [showUserMenu, setShowUserMenu] = useState(false)
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
  const [showPaywall, setShowPaywall] = useState(false)
  const [freeUsesLeft, setFreeUsesLeft] = useState(FREE_LIMIT)
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    setFreeUsesLeft(Math.max(0, FREE_LIMIT - getFreeUses()))
  }, [])

  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/credits')
      .then(r => r.json())
      .then(d => { if (d.credits !== undefined) setCredits(d.credits) })
      .catch(() => {})
  }, [isSignedIn])

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
    imageType?: string,
    signedIn?: boolean
  ) => {
    // Paywall check
    if (!signedIn && getFreeUses() >= FREE_LIMIT) {
      setShowPaywall(true)
      return
    }

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
        setScreen('home')
        if (!signedIn) {
          setShowPaywall(true)
        } else {
          setError(data.error ?? 'Analýza selhala. Zkuste znovu.')
        }
        return
      }

      const { _credits, ...analysis } = data
      setAnalysis(analysis)
      setScreen('result')
      if (!signedIn) {
        incrementFreeUses()
        setFreeUsesLeft(Math.max(0, FREE_LIMIT - getFreeUses()))
      } else if (_credits !== null && _credits !== undefined) {
        setCredits(_credits)
      }
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
        await analyze(undefined, result.imageBase64, result.imageType, !!isSignedIn)
      } else if (result.text) {
        const trimmed = result.text.trim()
        if (!trimmed) {
          setError(dg.errEmpty)
          return
        }
        setDocContent(trimmed)
        setDocImageBase64('')
        setDocImageType('')
        await analyze(trimmed, undefined, undefined, !!isSignedIn)
      } else {
        setError(dg.errUnsupported)
      }
    } catch (err: any) {
      setError(dg.errRead)
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

      {/* ── GLOBAL NAV (all screens) ── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoIcon}>🛡️</span>
          <span className={styles.navLogoText}>DocThink</span>
        </div>
        <div className={styles.navRight}>
          {isSignedIn && credits !== null && (
            <button
              className={`${styles.creditsChip} ${credits <= 3 ? styles.creditsChipLow : ''}`}
              onClick={() => router.push('/koupit')}
              title={dg.buyCredits}
            >
              <span className={styles.creditsNum}>{credits}</span>
              <span className={styles.creditsLabel}>kr</span>
            </button>
          )}
          {isSignedIn && (
            <button className={styles.buyBtn} onClick={() => router.push('/koupit')}>
              {dg.navBuy}
            </button>
          )}
          {isSignedIn && (
            <div className={styles.userMenuWrap}>
              <button
                className={styles.userAvatarBtn}
                onClick={() => setShowUserMenu(v => !v)}
              >
                {user?.imageUrl
                  ? <img src={user.imageUrl} className={styles.userAvatar} alt="avatar" />
                  : <span className={styles.userAvatarInitial}>{user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? '?'}</span>
                }
              </button>
              {showUserMenu && (
                <div className={styles.userMenu}>
                  <div className={styles.userMenuEmail}>{user?.emailAddresses?.[0]?.emailAddress}</div>
                  <button className={styles.userMenuItem} onClick={() => { setShowUserMenu(false); router.push('/koupit') }}>
                    {dg.buyCredits}
                  </button>
                  <button className={styles.userMenuItem} onClick={() => { setShowUserMenu(false); signOut(() => router.push('/')) }}>
                    {dg.signOut}
                  </button>
                </div>
              )}
            </div>
          )}
          {!isSignedIn && (
            <button className={styles.loginBtn} onClick={() => router.push('/sign-in')}>
              {dg.navLogin}
            </button>
          )}
        </div>
      </nav>

      {/* ── HOME ── */}
      {screen === 'home' && (
        <div className={styles.homeScreen}>
          <div className={styles.homeHeader}>
            <p className={styles.tagline}>{dg.tagline}</p>
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
            <p className={styles.uploadTitle}>{dg.uploadTitle}</p>
            <p className={styles.uploadSub}>{dg.uploadSub}</p>
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
              {dg.btnCamera}
            </button>
            <button
              className={styles.btnUpload}
              onClick={() => fileInputRef.current?.click()}
            >
              {dg.btnUpload}
            </button>
          </div>

          {!isSignedIn && freeUsesLeft > 0 && (
            <p className={styles.freeUsesNote}>
              {freeUsesLeft === FREE_LIMIT ? dg.freeStart : dg.freeLeft(freeUsesLeft)}
            </p>
          )}
          {!isSignedIn && freeUsesLeft === 0 && (
            <p className={styles.freeUsesNote} style={{ color: '#ef4444' }}>
              {dg.freeExhausted}
            </p>
          )}
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
            <h2 className={styles.analyzingTitle}>{dg.analyzingTitle}</h2>
            <p className={styles.analyzingSubtitle}>{dg.analyzingSub}</p>
          </div>

          <div className={styles.analyzingSteps}>
            {dg.steps.map((step, i) => (
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
              {dg.newBtn}
            </button>
            <span className={styles.topBarTitle}>{dg.resultTitle}</span>
            {isSignedIn && credits !== null ? (
              <button
                className={`${styles.creditsChip} ${credits <= 3 ? styles.creditsChipLow : ''}`}
                onClick={() => router.push('/koupit')}
              >
                <span className={styles.creditsNum}>{credits}</span>
                <span className={styles.creditsLabel}>kr</span>
              </button>
            ) : (
              <div style={{ width: 56 }} />
            )}
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
                <p className={styles.recommendationTitle}>{dg.recommendationTitle}</p>
                <p className={styles.recommendationText}>{analysis.recommendation}</p>
              </div>
            )}

            {/* Risks */}
            {analysis.risks.length > 0 && (
              <div className={styles.risksSection}>
                <p className={styles.sectionTitle}>{dg.risksTitle} ({analysis.risks.length})</p>
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
                <p className={styles.sectionTitle}>{dg.missingTitle}</p>
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
                placeholder={dg.chatPlaceholder}
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

      {/* ── PAYWALL MODAL ── */}
      {showPaywall && (
        <div className={styles.paywallOverlay} onClick={() => setShowPaywall(false)}>
          <div className={styles.paywallModal} onClick={e => e.stopPropagation()}>
            <div className={styles.paywallShield}>🛡️</div>
            <h2 className={styles.paywallTitle}>
              {freeUsesLeft === 0 ? dg.paywallTitleLogin : dg.paywallTitle}
            </h2>
            <p className={styles.paywallSub}>
              {freeUsesLeft === 0 ? dg.paywallSubLogin : dg.paywallSub}
            </p>

            <div className={styles.paywallFeatures}>
              {dg.paywallFeatures.map((text, i) => (
                <div key={i} className={styles.paywallFeature}>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <button
              className={styles.paywallCta}
              onClick={() => router.push('/sign-up')}
            >
              {dg.paywallCta}
            </button>
            <button
              className={styles.paywallLogin}
              onClick={() => router.push('/sign-in')}
            >
              {dg.paywallLogin}
            </button>
            <button
              className={styles.paywallClose}
              onClick={() => setShowPaywall(false)}
            >
              {dg.paywallClose}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

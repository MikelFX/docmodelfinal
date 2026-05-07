'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './Analyzer.module.css'

type Mode = 'chat' | 'summary' | 'actions' | 'risks' | 'qa' | 'deadlines' | 'rewrite' | 'translate' | 'template' | 'interview' | 'codegen' | 'email' | 'batch' | 'finance'

interface HistoryItem {
  id: string
  fileName: string
  mode: Mode
  result: string
  date: string
}

interface ChatMsg { role: 'ai' | 'user'; text: string }
interface ChatMessage { role: 'user' | 'assistant'; content: string; streaming?: boolean }

const MODES: { id: Mode; icon: string; credits: number; group: 'chat' | 'analyze' | 'tools' }[] = [
  { id: 'chat',      icon: '✨', credits: 0, group: 'chat'    },
  { id: 'summary',   icon: '📋', credits: 1, group: 'analyze' },
  { id: 'actions',   icon: '✅', credits: 1, group: 'analyze' },
  { id: 'risks',     icon: '⚠️', credits: 1, group: 'analyze' },
  { id: 'qa',        icon: '💬', credits: 1, group: 'analyze' },
  { id: 'deadlines', icon: '📅', credits: 1, group: 'analyze' },
  { id: 'rewrite',   icon: '✍️', credits: 2, group: 'tools'   },
  { id: 'translate', icon: '🌍', credits: 2, group: 'tools'   },
  { id: 'template',  icon: '📝', credits: 2, group: 'tools'   },
  { id: 'email',     icon: '📧', credits: 2, group: 'tools'   },
  { id: 'interview', icon: '🤖', credits: 5, group: 'tools'   },
  { id: 'codegen',   icon: '💻', credits: 3, group: 'tools'   },
  { id: 'finance',   icon: '💰', credits: 3, group: 'tools'   },
  { id: 'batch',     icon: '📦', credits: 1, group: 'tools'   },
]

const DEMO_TEXT = `DocThink Demo: Toto je ukázkový analytický dokument.
Projekt: Implementace CRM systému Q3 2025.
Zodpovědná osoba: Jana Nováková (PM), deadline 15.9.2025.
Úkoly: dokončit API integraci, otestovat import dat, školení týmu.
Rizika: závislost na externím dodavateli, možné zpoždění o 2-3 týdny.
Rozpočet: 450 000 Kč, aktuálně proinvestováno 280 000 Kč.
Závěr: projekt je v plánu, nutné sledovat rizika dodavatele.`

const TRANSLATE_LANGS = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'cs', label: '🇨🇿 Czech' },
  { code: 'de', label: '🇩🇪 German' },
  { code: 'sk', label: '🇸🇰 Slovak' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'it', label: '🇮🇹 Italian' },
  { code: 'pl', label: '🇵🇱 Polish' },
  { code: 'nl', label: '🇳🇱 Dutch' },
  { code: 'pt', label: '🇵🇹 Portuguese' },
  { code: 'ro', label: '🇷🇴 Romanian' },
  { code: 'hu', label: '🇭🇺 Hungarian' },
  { code: 'sv', label: '🇸🇪 Swedish' },
  { code: 'da', label: '🇩🇰 Danish' },
  { code: 'fi', label: '🇫🇮 Finnish' },
  { code: 'el', label: '🇬🇷 Greek' },
  { code: 'hr', label: '🇭🇷 Croatian' },
  { code: 'bg', label: '🇧🇬 Bulgarian' },
  { code: 'sl', label: '🇸🇮 Slovenian' },
  { code: 'et', label: '🇪🇪 Estonian' },
  { code: 'lv', label: '🇱🇻 Latvian' },
  { code: 'lt', label: '🇱🇹 Lithuanian' },
]

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

export default function Analyzer() {
  const { t } = useLanguage()

  const [mode, setMode] = useState<Mode>('chat')
  const [fileContent, setFileContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [credits, setCredits] = useState<number>(10)
  const creditsReady = useRef(false)
  const [question, setQuestion] = useState('')
  const [qLoading, setQLoading] = useState(false)
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const [rewriteStyle, setRewriteStyle] = useState<'formal' | 'simple'>('formal')
  const [targetLang, setTargetLang] = useState('en')
  const [templateDesc, setTemplateDesc] = useState('')
  const [templateLang, setTemplateLang] = useState('en')

  const [interviewType, setInterviewType] = useState('')
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [interviewChat, setInterviewChat] = useState<ChatMsg[]>([])
  const [interviewHistory, setInterviewHistory] = useState<{ role: string; content: string }[]>([])
  const [interviewInput, setInterviewInput] = useState('')
  const [interviewDoc, setInterviewDoc] = useState('')
  const [interviewLoading, setInterviewLoading] = useState(false)

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Input mode (file / paste text)
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file')

  // Email
  const [emailType, setEmailType] = useState('followup')
  const [emailRecipient, setEmailRecipient] = useState('')
  const [emailTone, setEmailTone] = useState<'formal' | 'friendly'>('formal')
  const [emailLang, setEmailLang] = useState('en')

  // Codegen
  const [codegenDesc, setCodegenDesc] = useState('')
  const [codegenType, setCodegenType] = useState('website')
  const [codegenLang, setCodegenLang] = useState('en')
  const [codegenResult, setCodegenResult] = useState('')
  const [codegenLoading, setCodegenLoading] = useState(false)

  // Chat credit tracking (1 credit per 5 AI responses)
  const [chatResponseCount, setChatResponseCount] = useState(0)

  // Batch
  const [batchFiles, setBatchFiles] = useState<File[]>([])
  const [batchAnalysisMode, setBatchAnalysisMode] = useState<'summary' | 'actions' | 'risks' | 'deadlines'>('summary')
  const [batchResults, setBatchResults] = useState<{ name: string; result: string; status: 'pending' | 'processing' | 'done' | 'error'; expanded: boolean }[]>([])
  const [batchRunning, setBatchRunning] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)

  const fileRef = useRef<HTMLInputElement>(null)
  const batchFileRef = useRef<HTMLInputElement>(null)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user } = useUser()

  useEffect(() => {
    const saved = localStorage.getItem('docthink_credits')
    if (saved !== null) setCredits(parseInt(saved, 10))
    creditsReady.current = true
  }, [])

  useEffect(() => {
    if (!creditsReady.current) return
    localStorage.setItem('docthink_credits', credits.toString())
  }, [credits])

  useEffect(() => {
    const saved = localStorage.getItem('docmind_history')
    if (saved) setHistory(JSON.parse(saved))
    fetch('/api/credits')
      .then(r => r.json())
      .then(d => {
        if (d.credits !== undefined) {
          setCredits(d.credits)
          localStorage.setItem('docthink_credits', d.credits.toString())
        }
      })
      .catch(() => { /* KV unavailable — localStorage value used */ })
  }, [user])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  async function spendCredits(cost: number): Promise<boolean> {
    if (cost === 0) return true
    if (credits < cost) { router.push('/koupit'); return false }
    const next = credits - cost
    setCredits(next)
    localStorage.setItem('docthink_credits', next.toString())
    try {
      const res = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'spend', amount: cost }),
      })
      const data = await res.json()
      if (data.credits !== undefined) {
        setCredits(data.credits)
        localStorage.setItem('docthink_credits', data.credits.toString())
      }
    } catch { /* KV unreachable — localStorage already updated */ }
    return true
  }

  async function restoreCredits(cost: number) {
    if (cost === 0) return
    setCredits(prev => {
      const next = prev + cost
      localStorage.setItem('docthink_credits', next.toString())
      return next
    })
    try {
      const res = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', amount: cost }),
      })
      const data = await res.json()
      if (data.credits !== undefined) {
        setCredits(data.credits)
        localStorage.setItem('docthink_credits', data.credits.toString())
      }
    } catch { /* KV unreachable — localStorage already updated */ }
  }

  function saveToHistory(res: string, fname: string, m: Mode) {
    const item: HistoryItem = {
      id: Date.now().toString(),
      fileName: fname || t.result.demoText,
      mode: m,
      result: res,
      date: new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    }
    const updated = [item, ...history].slice(0, 5)
    setHistory(updated)
    localStorage.setItem('docmind_history', JSON.stringify(updated))
  }

  async function handleFile(file: File) {
    setFileName(file.name)
    const kb = Math.round(file.size / 1024)
    setFileSize(kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB')

    if (file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items.map((item: any) => ('str' in item ? item.str : '')).join(' ')
          fullText += pageText + '\n'
        }
        setFileContent(fullText.trim() || 'PDF neobsahuje čitelný text.')
      } catch {
        setFileContent('Nepodařilo se načíst PDF.')
      }
    } else {
      const reader = new FileReader()
      reader.onload = (e) => setFileContent(e.target?.result as string)
      reader.readAsText(file)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const currentMode = MODES.find(m => m.id === mode)!
  const needsFile = ['summary', 'actions', 'risks', 'qa', 'deadlines', 'rewrite', 'translate', 'email', 'finance'].includes(mode)
  const showAnalyzeBtn = ['summary', 'actions', 'risks', 'qa', 'deadlines', 'rewrite', 'translate', 'finance'].includes(mode)

  // ── ANALYZE ──
  async function analyze() {
    const cost = currentMode.credits
    setLoading(true)
    setResult('')
    setAnswers([])
    if (!(await spendCredits(cost))) { setLoading(false); return }

    try {
      let res: Response
      const content = fileContent || DEMO_TEXT

      if (mode === 'rewrite') {
        res = await fetch('/api/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, style: rewriteStyle }),
        })
      } else if (mode === 'translate') {
        res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, targetLang }),
        })
      } else {
        res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, mode }),
        })
      }

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.result)
      saveToHistory(data.result, fileName, mode)
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Chyba. Zkus znovu.'
      setResult(`<p style="color:#F09595;font-size:13px">${msg}</p>`)
      restoreCredits(cost)
    } finally {
      setLoading(false)
    }
  }

  // ── TEMPLATE ──
  async function generateTemplate() {
    if (!templateDesc.trim()) return
    const cost = currentMode.credits
    setLoading(true)
    setResult('')
    if (!(await spendCredits(cost))) { setLoading(false); return }
    try {
      const res = await fetch('/api/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: templateDesc, language: templateLang }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.result)
      saveToHistory(data.result, templateDesc.slice(0, 30), mode)
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Chyba. Zkus znovu.'
      setResult(`<p style="color:#F09595;font-size:13px">${msg}</p>`)
      restoreCredits(cost)
    } finally {
      setLoading(false)
    }
  }

  // ── INTERVIEW ──
  async function startInterview() {
    if (!interviewType.trim()) return
    const cost = currentMode.credits
    setInterviewLoading(true)
    if (!(await spendCredits(cost))) { setInterviewLoading(false); return }
    setInterviewStarted(true)
    setInterviewChat([])
    setInterviewHistory([])
    setInterviewDoc('')
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: interviewType, history: [], userAnswer: null }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.question) {
        setInterviewChat([{ role: 'ai', text: data.question }])
        setInterviewHistory([{ role: 'assistant', content: data.question }])
      }
    } catch (err: any) {
      setInterviewChat([{ role: 'ai', text: 'Chyba: ' + (err.message || 'Zkus znovu.') }])
      restoreCredits(cost)
    } finally {
      setInterviewLoading(false)
    }
  }

  async function sendInterviewAnswer() {
    if (!interviewInput.trim() || interviewLoading) return
    const answer = interviewInput.trim()
    setInterviewInput('')
    const newChat: ChatMsg[] = [...interviewChat, { role: 'user', text: answer }]
    setInterviewChat(newChat)
    const newHistory = [...interviewHistory, { role: 'user', content: answer }]
    setInterviewLoading(true)
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: interviewType, history: newHistory }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.isFinished && data.document) {
        setInterviewDoc(data.document)
        setInterviewChat([...newChat, { role: 'ai', text: t.interview.start.includes('🚀') ? '✅ Dokument je hotov! Viz výsledek níže.' : '✅ Document ready! See result below.' }])
        saveToHistory(data.document, interviewType, mode)
      } else if (data.question) {
        setInterviewChat([...newChat, { role: 'ai', text: data.question }])
        setInterviewHistory([...newHistory, { role: 'assistant', content: data.question }])
      }
    } catch (err: any) {
      setInterviewChat([...newChat, { role: 'ai', text: 'Chyba: ' + (err.message || 'Zkus znovu.') }])
    } finally {
      setInterviewLoading(false)
    }
  }

  // ── CHAT ──
  async function sendChatMessage(text?: string) {
    const msg = (text ?? chatInput).trim()
    if (!msg || chatLoading) return

    // Charge 1 credit for every 5 AI responses already received
    if (chatResponseCount > 0 && chatResponseCount % 5 === 0) {
      if (!(await spendCredits(1))) return
    }

    setChatInput('')

    const newHistory = [...chatHistory, { role: 'user', content: msg }]
    setChatHistory(newHistory)
    setChatMessages(prev => [
      ...prev,
      { role: 'user', content: msg },
      { role: 'assistant', content: '', streaming: true },
    ])
    setChatLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory }),
      })

      if (!res.body) throw new Error('Žádný stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let rawContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content
            if (delta) {
              rawContent += delta
              const display = rawContent
                .replace(/<think>[\s\S]*?<\/think>/g, '')
                .replace(/<think>[\s\S]*/g, '')
                .trimStart()
              setChatMessages(prev => {
                const u = [...prev]
                u[u.length - 1] = { role: 'assistant', content: display, streaming: true }
                return u
              })
            }
          } catch { /* skip */ }
        }
      }

      const finalDisplay = rawContent
        .replace(/<think>[\s\S]*?<\/think>/g, '')
        .replace(/<think>[\s\S]*/g, '')
        .trimStart()

      setChatMessages(prev => {
        const u = [...prev]
        u[u.length - 1] = {
          role: 'assistant',
          content: finalDisplay || 'Omlouvám se, nepodařilo se získat odpověď.',
          streaming: false,
        }
        return u
      })
      setChatHistory([...newHistory, { role: 'assistant', content: finalDisplay }])
      setChatResponseCount(prev => prev + 1)
    } catch {
      setChatMessages(prev => {
        const u = [...prev]
        u[u.length - 1] = { role: 'assistant', content: 'Chyba připojení. Zkus znovu.', streaming: false }
        return u
      })
    } finally {
      setChatLoading(false)
    }
  }

  // ── EMAIL ──
  async function generateEmail() {
    const content = fileContent || DEMO_TEXT
    const cost = currentMode.credits
    setLoading(true)
    setResult('')
    if (!(await spendCredits(cost))) { setLoading(false); return }
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, emailType, recipient: emailRecipient, tone: emailTone, language: emailLang }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.result)
      saveToHistory(data.result, fileName || t.result.demoText, mode)
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Chyba. Zkus znovu.'
      setResult(`<p style="color:#F09595;font-size:13px">${msg}</p>`)
      restoreCredits(cost)
    } finally {
      setLoading(false)
    }
  }

  // ── CODEGEN ──
  async function generateCodegen() {
    if (!codegenDesc.trim()) return
    const cost = 3
    setCodegenLoading(true)
    setCodegenResult('')
    if (!(await spendCredits(cost))) { setCodegenLoading(false); return }
    try {
      const res = await fetch('/api/codegen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: codegenDesc, type: codegenType, language: codegenLang }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setCodegenResult(data.result)
      saveToHistory(data.result, 'Kód: ' + codegenDesc.slice(0, 30), mode)
    } catch (err: any) {
      setCodegenResult('Chyba: ' + (err instanceof Error ? err.message : 'Zkus znovu.'))
      restoreCredits(cost)
    } finally {
      setCodegenLoading(false)
    }
  }

  // ── BATCH ──
  async function readFileContent(file: File): Promise<string> {
    if (file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let text = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const tc = await page.getTextContent()
          text += tc.items.map((item: any) => ('str' in item ? item.str : '')).join(' ') + '\n'
        }
        return text.trim() || 'PDF neobsahuje čitelný text.'
      } catch { return 'Nepodařilo se načíst PDF.' }
    }
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target?.result as string || '')
      reader.readAsText(file)
    })
  }

  async function runBatchAnalysis() {
    if (batchFiles.length === 0 || batchRunning) return
    const total = batchFiles.length
    setBatchRunning(true)
    setBatchProgress(0)
    setBatchResults(batchFiles.map(f => ({ name: f.name, result: '', status: 'pending', expanded: false })))
    if (!(await spendCredits(total))) { setBatchRunning(false); return }

    let refunded = 0
    for (let i = 0; i < batchFiles.length; i++) {
      setBatchResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'processing' } : r))
      try {
        const content = await readFileContent(batchFiles[i])
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: content.slice(0, 3000), mode: batchAnalysisMode }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setBatchResults(prev => prev.map((r, idx) => idx === i ? { ...r, result: data.result, status: 'done', expanded: true } : r))
      } catch (err: any) {
        setBatchResults(prev => prev.map((r, idx) => idx === i ? { ...r, result: err.message || 'Chyba', status: 'error' } : r))
        refunded++
      }
      setBatchProgress(i + 1)
    }
    if (refunded > 0) restoreCredits(refunded)
    setBatchRunning(false)
  }

  // ── Q&A follow-up ──
  async function askQuestion() {
    if (!question.trim() || !result) return
    const q = question.trim()
    setQuestion('')
    setQLoading(true)
    setAnswers(prev => [...prev, { q, a: '...' }])
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: fileContent || DEMO_TEXT, question: q }),
      })
      const data = await res.json()
      setAnswers(prev => prev.map((item, i) => i === prev.length - 1 ? { ...item, a: data.result || 'Žádná odpověď.' } : item))
    } catch {
      setAnswers(prev => prev.map((item, i) => i === prev.length - 1 ? { ...item, a: 'Chyba.' } : item))
    } finally {
      setQLoading(false)
    }
  }

  // ── EXPORT ──
  function copyResult() {
    const text = mode === 'interview' && interviewDoc ? interviewDoc : stripHtml(result) + answers.map(a => `\n\nQ: ${a.q}\nA: ${a.a}`).join('')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function exportTxt() {
    const text = mode === 'interview' && interviewDoc ? interviewDoc : stripHtml(result)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `docthink-${mode}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportPdf() {
    const content = mode === 'interview' && interviewDoc
      ? `<pre style="white-space:pre-wrap;font-family:Arial">${interviewDoc}</pre>`
      : result
    const win = window.open('', '_blank')
    if (!win) return
    const modeName = (t.modes as any)[mode] || mode
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>DocThink</title>
      <style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;color:#1a1a1a;line-height:1.7}
      .header{border-bottom:2px solid #7F77DD;padding-bottom:12px;margin-bottom:24px}
      .logo{color:#7F77DD;font-size:20px;font-weight:bold}
      .meta{color:#888;font-size:13px;margin-top:4px}h4{color:#534AB7}</style>
      </head><body>
      <div class="header"><div class="logo">◆ docthink</div>
      <div class="meta">${modeName} · ${fileName || t.result.demoText} · ${new Date().toLocaleDateString('cs-CZ')}</div></div>
      ${content}</body></html>`)
    win.document.close()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  const hasResult = result || (mode === 'interview' && interviewDoc)
  const showUpload = needsFile

  return (
    <div className={styles.wrap}>
      <nav className={styles.nav}>
        <div className={styles.logo}><div className={styles.logoDot} />docthink</div>
        <div className={styles.navRight}>
          <div className={styles.credits}>
            <span className={styles.creditsN}>{credits}</span> {t.nav.credits}
          </div>
          <button className={styles.buyBtn} onClick={() => router.push('/koupit')}>{t.nav.buy}</button>
          <UserButton afterSignOutUrl='/' />
        </div>
      </nav>

      <div className={styles.main}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLabel}>{t.sidebar.aiAssistant}</div>
          {MODES.filter(m => m.group === 'chat').map(m => (
            <button key={m.id} className={`${styles.modeBtn} ${mode === m.id ? styles.modeBtnActive : ''}`}
              onClick={() => { setMode(m.id); setResult(''); setAnswers([]) }}>
              <span className={styles.modeIcon}>{m.icon}</span>
              <span className={styles.modeLabelText}>{(t.modes as any)[m.id]}</span>
              <span className={styles.modeCredits} style={{ color: '#5DCAA5', background: 'rgba(93,202,165,0.08)' }}>1k/5</span>
            </button>
          ))}

          <div className={styles.sidebarLabel} style={{ marginTop: 16 }}>{t.sidebar.docAnalysis}</div>
          {MODES.filter(m => m.group === 'analyze').map(m => (
            <button key={m.id} className={`${styles.modeBtn} ${mode === m.id ? styles.modeBtnActive : ''}`}
              onClick={() => { setMode(m.id); setResult(''); setAnswers([]) }}>
              <span className={styles.modeIcon}>{m.icon}</span>
              <span className={styles.modeLabelText}>{(t.modes as any)[m.id]}</span>
              <span className={styles.modeCredits}>{m.credits}k</span>
            </button>
          ))}

          <div className={styles.sidebarLabel} style={{ marginTop: 16 }}>{t.sidebar.aiTools}</div>
          {MODES.filter(m => m.group === 'tools').map(m => (
            <button key={m.id} className={`${styles.modeBtn} ${mode === m.id ? styles.modeBtnActive : ''}`}
              onClick={() => { setMode(m.id); setResult(''); setAnswers([]); setInterviewStarted(false); setCodegenResult('') }}>
              <span className={styles.modeIcon}>{m.icon}</span>
              <span className={styles.modeLabelText}>{(t.modes as any)[m.id]}</span>
              <span className={styles.modeCredits}>{m.credits}k</span>
            </button>
          ))}

          {history.length > 0 && (
            <>
              <div className={styles.sidebarLabel} style={{ marginTop: 16 }}>{t.sidebar.history}</div>
              {history.map(item => (
                <button key={item.id} className={styles.historyItem}
                  onClick={() => { setResult(item.result); setMode(item.mode); setFileName(item.fileName); setAnswers([]) }}
                  title={item.fileName}>
                  <span className={styles.historyName}>{item.fileName}</span>
                  <span className={styles.historyMeta}>{item.date}</span>
                </button>
              ))}
            </>
          )}
        </aside>

        <div className={styles.content}>

          {/* ── CHAT ── */}
          {mode === 'chat' && (
            <div className={styles.chatWrap}>
              {chatMessages.length === 0 ? (
                <div className={styles.chatWelcome}>
                  <div className={styles.chatWelcomeIcon}>
                    <div className={styles.chatWelcomeDot} />
                  </div>
                  <h2 className={styles.chatWelcomeTitle}>{t.chat.welcome}</h2>
                  <p className={styles.chatWelcomeSub}>{t.chat.sub}</p>
                  <div className={styles.chatSuggestions}>
                    {t.chat.suggestions.map((s, i) => (
                      <button key={i} className={styles.chatSuggestion}
                        style={{ animationDelay: `${i * 0.07}s` }}
                        onClick={() => sendChatMessage(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.chatThread}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={msg.role === 'assistant' ? styles.chatRowAi : styles.chatRowUser}>
                      {msg.role === 'assistant' && (
                        <div className={styles.chatAvatar}><div className={styles.chatAvatarDot} /></div>
                      )}
                      <div className={msg.role === 'assistant' ? styles.chatBubbleAi : styles.chatBubbleUser}>
                        {msg.content === '' && msg.streaming ? (
                          <div className={styles.chatTyping}><span /><span /><span /></div>
                        ) : (
                          <>
                            {msg.content}
                            {msg.streaming && <span className={styles.chatCursor} />}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>
              )}

              <div className={styles.chatInputWrap}>
                {chatMessages.length > 0 && (
                  <button className={styles.chatClearBtn}
                    onClick={() => { setChatMessages([]); setChatHistory([]) }}>
                    {t.chat.newChat}
                  </button>
                )}
                <div className={styles.chatInputRow}>
                  <input
                    className={styles.chatInput}
                    placeholder={t.chat.placeholder}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !chatLoading) { e.preventDefault(); sendChatMessage() } }}
                    disabled={chatLoading}
                    autoFocus
                  />
                  <button className={styles.chatSendBtn} onClick={() => sendChatMessage()}
                    disabled={chatLoading || !chatInput.trim()}>
                    {chatLoading ? (
                      <div className={styles.chatSendDots}><span /><span /><span /></div>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    )}
                  </button>
                </div>
                <p className={styles.chatHint}>{t.chat.hint}</p>
              </div>
            </div>
          )}

          {/* ── INPUT MODE TOGGLE ── */}
          {showUpload && (
            <div className={styles.inputModeToggle}>
              <button className={`${styles.inputModeBtn} ${inputMode === 'file' ? styles.inputModeBtnActive : ''}`}
                onClick={() => setInputMode('file')}>{t.inputMode.file}</button>
              <button className={`${styles.inputModeBtn} ${inputMode === 'text' ? styles.inputModeBtnActive : ''}`}
                onClick={() => setInputMode('text')}>{t.inputMode.text}</button>
            </div>
          )}

          {/* ── UPLOAD ── */}
          {showUpload && inputMode === 'file' && (
            <>
              <div className={`${styles.upload} ${dragging ? styles.uploadDrag : ''}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDrop={onDrop}
                onDragLeave={() => setDragging(false)}>
                <div className={styles.uploadIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </div>
                <div className={styles.uploadTitle}>{t.upload.title}</div>
                <div className={styles.uploadSub}>{t.upload.sub}</div>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }}
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
              {fileName && (
                <div className={styles.fileBar}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span className={styles.fileName}>{fileName}</span>
                  <span className={styles.fileSize}>{fileSize}</span>
                  <button className={styles.fileRemove} onClick={() => { setFileName(''); setFileContent('') }}>×</button>
                </div>
              )}
            </>
          )}

          {/* ── PASTE TEXT ── */}
          {showUpload && inputMode === 'text' && (
            <div className={styles.pasteWrap}>
              <textarea
                className={styles.pasteTextarea}
                placeholder={t.inputMode.placeholder}
                value={fileContent}
                onChange={e => { setFileContent(e.target.value); setFileName(e.target.value ? 'Vložený text' : '') }}
                rows={9}
              />
              {fileContent && (
                <div className={styles.pasteBar}>
                  <span className={styles.pasteChars}>{fileContent.length} {t.inputMode.chars}</span>
                  <button className={styles.pasteClear} onClick={() => { setFileContent(''); setFileName('') }}>{t.inputMode.clear}</button>
                </div>
              )}
            </div>
          )}

          {/* ── EMAIL OPTIONS ── */}
          {mode === 'email' && (
            <div className={styles.toolCard}>
              <div className={styles.toolCardTitle}>📧 {t.modes.email} <span className={styles.creditBadge}>2 kredity</span></div>
              <p className={styles.toolCardDesc}>{t.email.desc}</p>
              <div className={styles.optionRow}>
                <span className={styles.optionLabel}>{t.email.typeLabel}</span>
                {Object.entries(t.email.types).map(([key, label]) => (
                  <button key={key}
                    className={`${styles.optionBtn} ${emailType === key ? styles.optionBtnActive : ''}`}
                    onClick={() => setEmailType(key)}>
                    {label}
                  </button>
                ))}
              </div>
              <input className={styles.textInput}
                placeholder={t.email.recipientPlaceholder}
                value={emailRecipient}
                onChange={e => setEmailRecipient(e.target.value)} />
              <div className={styles.optionRow}>
                <span className={styles.optionLabel}>{t.email.toneLabel}</span>
                <button className={`${styles.optionBtn} ${emailTone === 'formal' ? styles.optionBtnActive : ''}`}
                  onClick={() => setEmailTone('formal')}>{t.email.formal}</button>
                <button className={`${styles.optionBtn} ${emailTone === 'friendly' ? styles.optionBtnActive : ''}`}
                  onClick={() => setEmailTone('friendly')}>{t.email.friendly}</button>
              </div>
              <div className={styles.optionRow}>
                <span className={styles.optionLabel}>{t.email.langLabel}</span>
                <select className={styles.langSelect} value={emailLang} onChange={e => setEmailLang(e.target.value)}>
                  {TRANSLATE_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
              <button className={styles.analyzeBtn} onClick={generateEmail} disabled={loading}>
                {loading
                  ? <span className={styles.loadingDots}><span /><span /><span /></span>
                  : t.email.generate}
              </button>
            </div>
          )}

          {/* ── REWRITE OPTIONS ── */}
          {mode === 'rewrite' && (
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>{t.rewrite.style}</span>
              <button className={`${styles.optionBtn} ${rewriteStyle === 'formal' ? styles.optionBtnActive : ''}`} onClick={() => setRewriteStyle('formal')}>{t.rewrite.formal}</button>
              <button className={`${styles.optionBtn} ${rewriteStyle === 'simple' ? styles.optionBtnActive : ''}`} onClick={() => setRewriteStyle('simple')}>{t.rewrite.simple}</button>
            </div>
          )}

          {/* ── TRANSLATE OPTIONS ── */}
          {mode === 'translate' && (
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>{t.translate.to}</span>
              <select className={styles.selectInput} value={targetLang} onChange={e => setTargetLang(e.target.value)}>
                {TRANSLATE_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
          )}

          {/* ── TEMPLATE ── */}
          {mode === 'template' && (
            <div className={styles.toolCard}>
              <div className={styles.toolCardTitle}>📝 {t.modes.template} <span className={styles.creditBadge}>2 kredity</span></div>
              <p className={styles.toolCardDesc}>{t.template.desc}</p>
              <textarea className={styles.textareaInput} placeholder={t.template.placeholder}
                value={templateDesc} onChange={e => setTemplateDesc(e.target.value)} rows={4} />
              <div className={styles.optionRow}>
                <span className={styles.optionLabel}>{t.template.langLabel}</span>
                <select className={styles.langSelect} value={templateLang} onChange={e => setTemplateLang(e.target.value)}>
                  {TRANSLATE_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
              <button className={styles.analyzeBtn} onClick={generateTemplate} disabled={loading || !templateDesc.trim()}>
                {loading ? <span className={styles.loadingDots}><span /><span /><span /></span> : t.template.generate}
              </button>
            </div>
          )}

          {/* ── INTERVIEW START ── */}
          {mode === 'interview' && !interviewStarted && (
            <div className={styles.toolCard}>
              <div className={styles.toolCardTitle}>🤖 {t.modes.interview} <span className={styles.creditBadge}>5 kreditů</span></div>
              <p className={styles.toolCardDesc}>{t.interview.desc}</p>
              <input className={styles.textInput} placeholder={t.interview.placeholder}
                value={interviewType} onChange={e => setInterviewType(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && startInterview()} />
              <button className={styles.analyzeBtn} onClick={startInterview} disabled={interviewLoading || !interviewType.trim()}>
                {interviewLoading ? <span className={styles.loadingDots}><span /><span /><span /></span> : t.interview.start}
              </button>
            </div>
          )}

          {/* ── INTERVIEW CHAT ── */}
          {mode === 'interview' && interviewStarted && (
            <div className={styles.interviewBox}>
              <div className={styles.interviewHeader}>
                <span className={styles.resultLabel}>🤖 {t.modes.interview} — {interviewType}</span>
                <button className={styles.actionBtn} onClick={() => { setInterviewStarted(false); setInterviewDoc('') }}>{t.interview.newBtn}</button>
              </div>
              <div className={styles.chatArea}>
                {interviewChat.map((msg, i) => (
                  <div key={i} className={msg.role === 'ai' ? styles.chatAi : styles.chatUser}>{msg.text}</div>
                ))}
                {interviewLoading && (
                  <div className={styles.chatAi}>
                    <div className={styles.loadingRow}><div className={styles.dot} /><div className={styles.dot} /><div className={styles.dot} /></div>
                  </div>
                )}
              </div>
              {!interviewDoc && (
                <div className={styles.questionBar}>
                  <input className={styles.questionInput} placeholder={t.interview.answerPlaceholder}
                    value={interviewInput} onChange={e => setInterviewInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendInterviewAnswer()} disabled={interviewLoading} />
                  <button className={styles.questionBtn} onClick={sendInterviewAnswer} disabled={interviewLoading}>{t.interview.send}</button>
                </div>
              )}
              {interviewDoc && (
                <div className={styles.interviewResult}>
                  <div className={styles.interviewResultHeader}>
                    <span style={{ color: '#5DCAA5', fontSize: 12 }}>✅ Dokument vygenerován</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className={styles.actionBtn} onClick={copyResult}>{copied ? t.result.copied : t.result.copy}</button>
                      <button className={styles.actionBtn} onClick={exportTxt}>{t.result.txt}</button>
                      <button className={styles.actionBtn} onClick={exportPdf}>{t.result.pdf}</button>
                    </div>
                  </div>
                  <pre className={styles.interviewDoc}>{interviewDoc}</pre>
                </div>
              )}
            </div>
          )}

          {/* ── CODEGEN ── */}
          {mode === 'codegen' && (
            <div className={styles.toolCard}>
              <div className={styles.toolCardTitle}>💻 {t.modes.codegen} <span className={styles.creditBadge}>3 kredity</span></div>
              <p className={styles.toolCardDesc}>{t.codegen.desc}</p>
              <textarea className={styles.textareaInput} placeholder={t.codegen.placeholder}
                value={codegenDesc} onChange={e => setCodegenDesc(e.target.value)} rows={4} />
              <div className={styles.optionRow}>
                <span className={styles.optionLabel}>{t.codegen.typeLabel}</span>
                {(['website', 'landing', 'component', 'script'] as const).map(type => (
                  <button key={type}
                    className={`${styles.optionBtn} ${codegenType === type ? styles.optionBtnActive : ''}`}
                    onClick={() => setCodegenType(type)}>
                    {(t.codegen.types as any)[type]}
                  </button>
                ))}
              </div>
              <div className={styles.optionRow}>
                <span className={styles.optionLabel}>{t.codegen.langLabel}</span>
                <select className={styles.langSelect} value={codegenLang} onChange={e => setCodegenLang(e.target.value)}>
                  {TRANSLATE_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
              <button className={styles.analyzeBtn} onClick={generateCodegen}
                disabled={codegenLoading || !codegenDesc.trim()}>
                {codegenLoading
                  ? <span className={styles.loadingDots}><span /><span /><span /></span>
                  : t.codegen.generate}
              </button>
              {codegenLoading && (
                <p style={{ color: '#9590c8', fontSize: 13, margin: '8px 0 0' }}>{t.codegen.loading}</p>
              )}
              {codegenResult && !codegenLoading && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <button className={styles.actionBtn} onClick={() => navigator.clipboard.writeText(codegenResult)}>{t.codegen.copy}</button>
                    <button className={styles.actionBtn} onClick={() => {
                      const ext = codegenType === 'component' ? '.tsx' : codegenType === 'script' ? '.js' : '.html'
                      const blob = new Blob([codegenResult], { type: 'text/plain;charset=utf-8' })
                      const a = document.createElement('a')
                      a.href = URL.createObjectURL(blob)
                      a.download = `docthink-code${ext}`
                      a.click()
                    }}>{t.codegen.download}</button>
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6, color: '#c8c4e8', background: 'rgba(255,255,255,0.04)', padding: 16, borderRadius: 8, maxHeight: 520, overflowY: 'auto', margin: 0 }}>{codegenResult}</pre>
                </div>
              )}
            </div>
          )}

          {/* ── BATCH ── */}
          {mode === 'batch' && (
            <div className={styles.toolCard}>
              <div className={styles.toolCardTitle}>
                📦 {t.modes.batch}
                <span className={styles.creditBadge}>1 kredit / dokument</span>
                <span className={styles.teamBadge}>Team</span>
              </div>
              <p className={styles.toolCardDesc}>
                Nahraj 10–25 dokumentů a AI je analyzuje všechny najednou. Výsledky jsou zobrazeny jednotlivě a lze je exportovat.
              </p>

              <div className={styles.batchUploadZone} onClick={() => batchFileRef.current?.click()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <span>Přidat dokumenty (max 25) — PDF · Word · TXT</span>
                <input ref={batchFileRef} type="file" multiple accept=".pdf,.txt,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const added = Array.from(e.target.files || [])
                    setBatchFiles(prev => [...prev, ...added].slice(0, 25))
                    e.target.value = ''
                  }} />
              </div>

              {batchFiles.length > 0 && (
                <div className={styles.batchFileList}>
                  <div className={styles.batchFileListHeader}>
                    <span className={styles.batchFileCount}>{batchFiles.length} / 25 dokumentů</span>
                    <button className={styles.pasteClear} onClick={() => setBatchFiles([])}>Vymazat vše</button>
                  </div>
                  {batchFiles.map((f, i) => (
                    <div key={i} className={styles.batchFileItem}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span className={styles.batchFileItemName}>{f.name}</span>
                      <button className={styles.fileRemove} onClick={() => setBatchFiles(prev => prev.filter((_, idx) => idx !== i))}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.optionRow}>
                <span className={styles.optionLabel}>Typ analýzy:</span>
                {(['summary', 'actions', 'risks', 'deadlines'] as const).map(m => (
                  <button key={m}
                    className={`${styles.optionBtn} ${batchAnalysisMode === m ? styles.optionBtnActive : ''}`}
                    onClick={() => setBatchAnalysisMode(m)}>
                    {(t.modes as any)[m]}
                  </button>
                ))}
              </div>

              {batchRunning && (
                <div className={styles.batchProgressWrap}>
                  <div className={styles.batchProgressBar}>
                    <div className={styles.batchProgressFill}
                      style={{ width: `${batchFiles.length > 0 ? (batchProgress / batchFiles.length) * 100 : 0}%` }} />
                  </div>
                  <span className={styles.batchProgressText}>
                    Zpracovávám {batchProgress} / {batchFiles.length} dokumentů…
                  </span>
                </div>
              )}

              <button className={styles.analyzeBtn} onClick={runBatchAnalysis}
                disabled={batchRunning || batchFiles.length === 0}>
                {batchRunning
                  ? <span className={styles.loadingDots}><span /><span /><span /></span>
                  : `📦 Analyzovat ${batchFiles.length > 0 ? `${batchFiles.length} dokumentů` : 'dokumenty'} — ${batchFiles.length} kreditů`}
              </button>

              {batchResults.length > 0 && (
                <div className={styles.batchResults}>
                  <div className={styles.batchResultsHeader}>
                    <span className={styles.batchResultsTitle}>
                      Výsledky — {batchResults.filter(r => r.status === 'done').length}/{batchResults.length} hotovo
                    </span>
                    {batchResults.some(r => r.status === 'done') && (
                      <button className={styles.actionBtn} onClick={() => {
                        const all = batchResults
                          .filter(r => r.status === 'done')
                          .map(r => `=== ${r.name} ===\n${stripHtml(r.result)}`)
                          .join('\n\n')
                        const blob = new Blob([all], { type: 'text/plain;charset=utf-8' })
                        const a = document.createElement('a')
                        a.href = URL.createObjectURL(blob)
                        a.download = `docthink-batch-${Date.now()}.txt`
                        a.click()
                      }}>⬇ Stáhnout vše (.txt)</button>
                    )}
                  </div>
                  {batchResults.map((r, i) => (
                    <div key={i} className={styles.batchResultItem}>
                      <div className={styles.batchResultHeader}
                        onClick={() => setBatchResults(prev => prev.map((item, idx) => idx === i ? { ...item, expanded: !item.expanded } : item))}>
                        <div className={styles.batchResultName}>
                          <span className={
                            r.status === 'done' ? styles.batchStatusDone :
                            r.status === 'error' ? styles.batchStatusError :
                            r.status === 'processing' ? styles.batchStatusProcessing :
                            styles.batchStatusPending}>
                            {r.status === 'done' ? '✓' : r.status === 'error' ? '✗' : r.status === 'processing' ? (
                              <span className={styles.batchSpinner} />
                            ) : '○'}
                          </span>
                          <span>{r.name}</span>
                        </div>
                        {r.status === 'done' && <span className={styles.batchChevron}>{r.expanded ? '▲' : '▼'}</span>}
                      </div>
                      {r.expanded && r.result && (
                        <div className={styles.batchResultBody}
                          dangerouslySetInnerHTML={{ __html: r.result }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ANALYZE BUTTON ── */}
          {showAnalyzeBtn && (
            <button className={styles.analyzeBtn} onClick={analyze} disabled={loading}>
              {loading
                ? <span className={styles.loadingDots}><span /><span /><span /></span>
                : (<>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  {t.analyzeBtn((t.modes as any)[mode], currentMode.credits)}
                </>)
              }
            </button>
          )}

          {/* ── RESULT BOX ── */}
          {(result || loading) && mode !== 'interview' && (
            <div className={styles.resultBox}>
              <div className={styles.resultHeader}>
                <span className={styles.resultLabel}>{(t.modes as any)[mode]}</span>
                <div className={styles.resultActions}>
                  {result && !loading && (
                    <>
                      <button className={styles.actionBtn} onClick={copyResult}>{copied ? t.result.copied : t.result.copy}</button>
                      <button className={styles.actionBtn} onClick={exportTxt}>{t.result.txt}</button>
                      <button className={styles.actionBtn} onClick={exportPdf}>{t.result.pdf}</button>
                    </>
                  )}
                  <span className={styles.resultMeta}>{fileName || t.result.demoText}</span>
                </div>
              </div>
              <div className={styles.resultBody}>
                {loading ? (
                  <div className={styles.loadingRow}><div className={styles.dot} /><div className={styles.dot} /><div className={styles.dot} /><span>{t.result.processing}</span></div>
                ) : mode === 'rewrite' || mode === 'translate' || mode === 'template' || mode === 'email' ? (
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.8, color: '#c8c4e8' }}>{result}</pre>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: result }} />
                )}
                {answers.map((a, i) => (
                  <div key={i} className={styles.answerCard}>
                    <p className={styles.answerQ}>{a.q}</p>
                    <p className={styles.answerA}>{a.a === '...' ? <span style={{ color: '#555' }}>{t.result.loading ?? 'načítám…'}</span> : a.a}</p>
                  </div>
                ))}
              </div>
              {result && !loading && ['summary', 'actions', 'risks', 'qa'].includes(mode) && (
                <div className={styles.questionBar}>
                  <input className={styles.questionInput} placeholder={t.result.ask}
                    value={question} onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !qLoading && askQuestion()} disabled={qLoading} />
                  <button className={styles.questionBtn} onClick={askQuestion} disabled={qLoading}>
                    {qLoading ? '...' : t.result.askBtn}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE BOTTOM BAR ── */}
      <div className={styles.mobileBar}>
        <button className={styles.mobileBarMode} onClick={() => setMobileSheetOpen(true)}>
          <span className={styles.mobileBarIcon}>{currentMode.icon}</span>
          <span className={styles.mobileBarLabel}>{(t.modes as any)[mode]}</span>
          {mode === 'chat'
            ? <span className={styles.mobileBarCredits} style={{ color: '#5DCAA5', background: 'rgba(93,202,165,0.08)' }}>1k/5</span>
            : currentMode.credits > 0 && <span className={styles.mobileBarCredits}>{currentMode.credits}k</span>
          }
        </button>
        <button className={styles.mobileBarMenu} onClick={() => setMobileSheetOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        </button>
      </div>

      {/* ── MOBILE SHEET ── */}
      {mobileSheetOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileSheetOpen(false)}>
          <div className={styles.mobileSheet} onClick={e => e.stopPropagation()}>
            <div className={styles.mobileSheetHandle} />
            <div className={styles.mobileSheetContent}>
              <div className={styles.mobileSheetSection}>{t.sidebar.aiAssistant}</div>
              <div className={styles.mobileGrid}>
                {MODES.filter(m => m.group === 'chat').map(m => (
                  <button key={m.id}
                    className={`${styles.mobileGridItem} ${mode === m.id ? styles.mobileGridItemActive : ''}`}
                    onClick={() => { setMode(m.id); setResult(''); setAnswers([]); setMobileSheetOpen(false) }}>
                    <span className={styles.mobileGridIcon}>{m.icon}</span>
                    <span className={styles.mobileGridLabel}>{(t.modes as any)[m.id]}</span>
                    <span className={styles.mobileGridCost} style={{ color: '#5DCAA5', background: 'rgba(93,202,165,0.07)' }}>1k/5</span>
                  </button>
                ))}
              </div>
              <div className={styles.mobileSheetSection}>{t.sidebar.docAnalysis}</div>
              <div className={styles.mobileGrid}>
                {MODES.filter(m => m.group === 'analyze').map(m => (
                  <button key={m.id}
                    className={`${styles.mobileGridItem} ${mode === m.id ? styles.mobileGridItemActive : ''}`}
                    onClick={() => { setMode(m.id); setResult(''); setAnswers([]); setMobileSheetOpen(false) }}>
                    <span className={styles.mobileGridIcon}>{m.icon}</span>
                    <span className={styles.mobileGridLabel}>{(t.modes as any)[m.id]}</span>
                    <span className={styles.mobileGridCost}>{m.credits}k</span>
                  </button>
                ))}
              </div>
              <div className={styles.mobileSheetSection}>{t.sidebar.aiTools}</div>
              <div className={styles.mobileGrid}>
                {MODES.filter(m => m.group === 'tools').map(m => (
                  <button key={m.id}
                    className={`${styles.mobileGridItem} ${mode === m.id ? styles.mobileGridItemActive : ''}`}
                    onClick={() => { setMode(m.id); setResult(''); setAnswers([]); setInterviewStarted(false); setCodegenResult(''); setMobileSheetOpen(false) }}>
                    <span className={styles.mobileGridIcon}>{m.icon}</span>
                    <span className={styles.mobileGridLabel}>{(t.modes as any)[m.id]}</span>
                    <span className={styles.mobileGridCost}>{m.credits}k</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

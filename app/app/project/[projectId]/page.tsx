'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { useLanguage } from '@/contexts/LanguageContext'
import { useProjects } from '@/lib/useProjects'
import Analyzer from '@/components/Analyzer'
import KnowledgeGraph from '@/components/KnowledgeGraph'
import type { ProjectDocument } from '@/lib/types'
import styles from './page.module.css'

interface Props { params: Promise<{ projectId: string }> }

const PDF_ACCEPT = '.pdf,.docx,.txt'

export default function ProjectPage({ params }: Props) {
  const { projectId } = use(params)
  const router = useRouter()
  const { t } = useLanguage()
  const { user } = useUser()
  const { projects, loaded, addDocument, removeDocument, addAnalysis, updateProject } = useProjects()
  const p = t.projects

  const [credits, setCredits] = useState(10)
  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  const [showGraph, setShowGraph] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [generatingMemory, setGeneratingMemory] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('docthink_credits')
    if (saved) setCredits(parseInt(saved, 10))
    fetch('/api/credits').then(r => r.json()).then(d => {
      if (d.credits !== undefined) {
        setCredits(d.credits)
        localStorage.setItem('docthink_credits', d.credits.toString())
      }
    }).catch(() => {})
  }, [user])

  const project = projects.find(pr => pr.id === projectId)
  const activeDoc = project?.documents.find(d => d.id === activeDocId) ?? null

  // PDF/txt/docx extraction (same logic as Analyzer)
  async function processFile(file: File): Promise<{ content: string; size: string }> {
    const mb = (file.size / 1024 / 1024).toFixed(1)
    const size = `${mb} MB`
    if (file.name.endsWith('.txt')) {
      const text = await file.text()
      return { content: text, size }
    }
    if (file.name.toLowerCase().endsWith('.pdf')) {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
      const buf = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise
      const pages: string[] = []
      for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) {
        const pg = await pdf.getPage(i)
        const tc = await pg.getTextContent()
        pages.push(tc.items.map((it: any) => ('str' in it ? it.str : '')).join(' '))
      }
      return { content: pages.join('\n').trim() || 'PDF neobsahuje čitelný text.', size }
    }
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve({ content: (e.target?.result as string) || '', size })
      reader.readAsText(file)
    })
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || !project) return
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) continue
      try {
        const { content, size } = await processFile(file)
        const doc = addDocument(project.id, { name: file.name, content, size: file.size, type: file.type })
        setActiveDocId(doc.id)
      } catch {}
    }
  }

  function handleAnalysisResult(mode: string, result: string, _fileName: string) {
    if (!project || !activeDocId) return
    addAnalysis(project.id, activeDocId, { mode, result })
  }

  async function refreshMemory() {
    if (!project || project.documents.length === 0) return
    setGeneratingMemory(true)
    try {
      const allAnalyses = project.documents.flatMap(d =>
        d.analyses.slice(0, 2).map(a => `[${d.name} — ${a.mode}]: ${a.result.slice(0, 300)}`)
      ).join('\n\n')
      const prompt = `Based on these document analyses from the project "${project.name}", write a concise 3-4 sentence AI memory summary capturing the key themes, entities, and insights:\n\n${allAnalyses}`
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: prompt, mode: 'summary', lang: 'en' }),
      })
      const data = await res.json()
      if (data.result) {
        const plain = data.result.replace(/<[^>]+>/g, '').trim()
        updateProject(project.id, { memoryContext: plain })
      }
    } catch {}
    setGeneratingMemory(false)
  }

  if (!loaded) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loadingDots}><span /><span /><span /></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className={styles.notFound}>
        <div>Project not found.</div>
        <button onClick={() => router.push('/app')}>{p.back}</button>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <input ref={fileRef} type="file" accept={PDF_ACCEPT} multiple style={{ display: 'none' }} onChange={e => handleFileUpload(e.target.files)} />

      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <button className={styles.backBtn} onClick={() => router.push('/app')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            <span className={styles.backText}>{p.back}</span>
          </button>
          <div className={styles.navDivider} />
          <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(v => !v)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </button>
          <div className={styles.projectBreadcrumb}>
            <span className={styles.projectBreadcrumbIcon}>{project.icon}</span>
            <span className={styles.projectBreadcrumbName}>{project.name}</span>
          </div>
        </div>
        <div className={styles.navRight}>
          <div className={`${styles.credits} ${credits <= 3 && credits > 0 ? styles.creditsLow : ''}`}>
            <span className={styles.creditsN}>{credits}</span>
            <span>{t.nav.credits}</span>
          </div>
          <button className={styles.addDocBtn} onClick={() => fileRef.current?.click()}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>{p.addDoc}</span>
          </button>
          <button
            className={`${styles.graphToggleBtn} ${showGraph ? styles.graphToggleBtnActive : ''}`}
            onClick={() => setShowGraph(v => !v)}
            title={showGraph ? p.hideGraph : p.showGraph}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="12" cy="18" r="3" />
              <line x1="9" y1="6" x2="15" y2="6" /><line x1="7" y1="9" x2="11" y2="15" /><line x1="17" y1="9" x2="13" y2="15" />
            </svg>
          </button>
          <button className={styles.buyBtn} onClick={() => router.push('/koupit')}>{t.nav.buy}</button>
          <UserButton afterSignOutUrl='/' />
        </div>
      </nav>

      <div className={styles.body}>

        {/* SIDEBAR */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarInner}>

            {/* DOCS */}
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarSectionTitle}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                Documents
              </div>

              {project.documents.length === 0 ? (
                <div className={styles.noDocsMsg}>
                  <div>{p.noDocuments}</div>
                  <div className={styles.noDocsMsgSub}>{p.noDocumentsDesc}</div>
                  <button className={styles.uploadDocBtn} onClick={() => fileRef.current?.click()}>{p.addDoc}</button>
                </div>
              ) : (
                <div className={styles.docList}>
                  {project.documents.map(doc => (
                    <div
                      key={doc.id}
                      className={`${styles.docItem} ${activeDocId === doc.id ? styles.docItemActive : ''}`}
                    >
                      <button className={styles.docItemBtn} onClick={() => { setActiveDocId(doc.id); setSidebarOpen(false) }}>
                        <span className={styles.docIcon}>📄</span>
                        <div className={styles.docItemContent}>
                          <div className={styles.docName}>{doc.name}</div>
                          {doc.analyses.length > 0 && (
                            <div className={styles.docMeta}>{doc.analyses.length} {p.analysesCount}</div>
                          )}
                        </div>
                      </button>
                      <button
                        className={styles.docRemoveBtn}
                        onClick={() => setConfirmRemove(doc.id)}
                        title="Remove"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* KNOWLEDGE GRAPH */}
            {showGraph && project.documents.length >= 2 && (
              <div className={styles.sidebarSection}>
                <div className={styles.sidebarSectionTitle}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="12" cy="18" r="2" />
                    <line x1="8" y1="6" x2="16" y2="6" /><line x1="7" y1="8" x2="11" y2="16" /><line x1="17" y1="8" x2="13" y2="16" />
                  </svg>
                  {p.graphTitle}
                </div>
                <KnowledgeGraph
                  documents={project.documents}
                  activeDocId={activeDocId ?? undefined}
                  onSelectDoc={id => { setActiveDocId(id); setSidebarOpen(false) }}
                />
              </div>
            )}

            {showGraph && project.documents.length < 2 && (
              <div className={styles.sidebarSection}>
                <div className={styles.sidebarSectionTitle}>{p.graphTitle}</div>
                <div className={styles.graphEmptyMsg}>{p.graphEmpty}</div>
              </div>
            )}

            {/* AI MEMORY */}
            <div className={styles.sidebarSection}>
              <div className={styles.sidebarSectionTitle}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {p.memoryTitle}
              </div>
              {project.memoryContext ? (
                <div className={styles.memoryText}>{project.memoryContext}</div>
              ) : (
                <div className={styles.memoryEmpty}>{p.memoryEmpty}</div>
              )}
              {project.documents.some(d => d.analyses.length > 0) && (
                <button className={styles.refreshMemoryBtn} onClick={refreshMemory} disabled={generatingMemory}>
                  {generatingMemory ? p.generating : p.memoryRefresh}
                </button>
              )}
            </div>

          </div>
        </aside>

        {/* SIDEBAR OVERLAY (mobile) */}
        {sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />}

        {/* KNOWLEDGE GRAPH FULLSCREEN (desktop, when no doc selected) */}
        {showGraph && !activeDocId && project.documents.length > 0 && (
          <div className={styles.graphPanel}>
            <div className={styles.graphPanelTitle}>{p.graphTitle}</div>
            {project.documents.length < 2
              ? <div className={styles.graphEmptyMsg}>{p.graphEmpty}</div>
              : <KnowledgeGraph documents={project.documents} onSelectDoc={id => setActiveDocId(id)} />
            }
          </div>
        )}

        {/* ANALYZER */}
        <div className={styles.analyzerWrap}>
          {!activeDocId && project.documents.length > 0 && !showGraph && (
            <div className={styles.selectDocHint}>
              <div className={styles.selectDocIcon}>📂</div>
              <div>{p.selectDoc} <button className={styles.selectDocLink} onClick={() => fileRef.current?.click()}>{p.uploadNew}</button></div>
            </div>
          )}
          <Analyzer
            key={activeDocId ?? 'empty'}
            initialContent={activeDoc?.content}
            initialFileName={activeDoc?.name}
            onAnalysisResult={handleAnalysisResult}
            hideNav
          />
        </div>
      </div>

      {/* CONFIRM REMOVE DOC */}
      {confirmRemove && (
        <div className={styles.overlay} onClick={() => setConfirmRemove(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmTitle}>Remove document from project?</div>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmRemove(null)}>{p.cancel}</button>
              <button
                className={styles.deleteBtnRed}
                onClick={() => { removeDocument(project.id, confirmRemove); if (activeDocId === confirmRemove) setActiveDocId(null); setConfirmRemove(null) }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { useLanguage } from '@/contexts/LanguageContext'
import { useProjects } from '@/lib/useProjects'
import styles from './ProjectsDashboard.module.css'

const ICONS = ['📋', '⚖️', '💼', '📊', '🔬', '🏥', '🎓', '💰', '🏗️', '🌍', '📝', '🎯', '🗂️', '📌']
const COLORS = ['#7F77DD', '#5DCAA5', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981']

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

export default function ProjectsDashboard() {
  const router = useRouter()
  const { t } = useLanguage()
  const { user } = useUser()
  const { projects, loaded, createProject, deleteProject } = useProjects()
  const [credits, setCredits] = useState(10)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newIcon, setNewIcon] = useState('📋')
  const [newColor, setNewColor] = useState('#7F77DD')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const p = t.projects

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

  useEffect(() => {
    if (creating) setTimeout(() => nameRef.current?.focus(), 50)
  }, [creating])

  const filtered = projects.filter(proj =>
    proj.name.toLowerCase().includes(search.toLowerCase()) ||
    proj.description.toLowerCase().includes(search.toLowerCase())
  )

  function handleCreate() {
    if (!newName.trim()) return
    const proj = createProject(newName.trim(), newDesc.trim(), newIcon, newColor)
    setCreating(false)
    setNewName('')
    setNewDesc('')
    setNewIcon('📋')
    setNewColor('#7F77DD')
    router.push(`/app/project/${proj.id}`)
  }

  function handleDeleteConfirm(id: string) {
    deleteProject(id)
    setConfirmDelete(null)
  }

  const totalDocs = projects.reduce((acc, proj) => acc + proj.documents.length, 0)

  return (
    <div className={styles.wrap}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <div className={styles.logoDot} />
          docthink
        </div>
        <div className={styles.navRight}>
          <div className={`${styles.credits} ${credits <= 3 && credits > 0 ? styles.creditsLow : ''}`}>
            <span className={styles.creditsN}>{credits}</span>
            <span className={styles.creditsLabel}>{t.nav.credits}</span>
          </div>
          <button className={styles.buyBtn} onClick={() => router.push('/koupit')}>{t.nav.buy}</button>
          <UserButton afterSignOutUrl='/' />
        </div>
      </nav>

      {/* CONTENT */}
      <div className={styles.content}>

        {/* PAGE HEADER */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <h1 className={styles.pageTitle}>{p.title}</h1>
            <div className={styles.pageMeta}>
              <span>{projects.length} {p.projectsCount}</span>
              {totalDocs > 0 && <><span className={styles.dot}>·</span><span>{totalDocs} {p.documents}</span></>}
            </div>
          </div>
          <button className={styles.newBtn} onClick={() => setCreating(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {p.new}
          </button>
        </div>

        {/* SEARCH */}
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.search}
            placeholder={p.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch('')}>×</button>
          )}
        </div>

        {loaded && (
          <>
            {/* EMPTY STATE */}
            {projects.length === 0 && (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🗂️</div>
                <div className={styles.emptyTitle}>{p.emptyTitle}</div>
                <div className={styles.emptyDesc}>{p.emptyDesc}</div>
                <button className={styles.emptyCreateBtn} onClick={() => setCreating(true)}>
                  {p.new}
                </button>
              </div>
            )}

            {/* PROJECT GRID */}
            {filtered.length > 0 && (
              <div className={styles.grid}>
                {filtered.map(proj => (
                  <div
                    key={proj.id}
                    className={styles.card}
                    onClick={() => router.push(`/app/project/${proj.id}`)}
                  >
                    <div className={styles.cardTop} style={{ background: `linear-gradient(135deg, ${proj.color}22, ${proj.color}08)`, borderBottom: `0.5px solid ${proj.color}30` }}>
                      <span className={styles.cardIcon}>{proj.icon}</span>
                      <button
                        className={styles.cardDeleteBtn}
                        onClick={e => { e.stopPropagation(); setConfirmDelete(proj.id) }}
                        title={p.delete}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardName}>{proj.name}</div>
                      {proj.description && <div className={styles.cardDesc}>{proj.description}</div>}
                    </div>
                    <div className={styles.cardFooter}>
                      <div className={styles.cardFooterLeft}>
                        <span className={styles.cardDocsBadge}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                          </svg>
                          {proj.documents.length} {p.docs}
                        </span>
                      </div>
                      <span className={styles.cardTime}>{timeAgo(proj.updatedAt)}</span>
                    </div>
                    <div className={styles.cardAccentBar} style={{ background: proj.color }} />
                  </div>
                ))}
              </div>
            )}

            {/* NO SEARCH RESULTS */}
            {filtered.length === 0 && search && (
              <div className={styles.noResults}>
                <span>No projects match "{search}"</span>
              </div>
            )}

            {/* QUICK ANALYSIS */}
            <button className={styles.quickCard} onClick={() => router.push('/app/quick')}>
              <div className={styles.quickLeft}>
                <div className={styles.quickIconWrap}>⚡</div>
                <div>
                  <div className={styles.quickTitle}>{p.quickAnalysis}</div>
                  <div className={styles.quickDesc}>{p.quickDesc}</div>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#3d3a55', flexShrink: 0 }}>
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* CREATE MODAL */}
      {creating && (
        <div className={styles.overlay} onClick={() => setCreating(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>{p.createTitle}</div>
              <button className={styles.modalClose} onClick={() => setCreating(false)}>×</button>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalLabel}>{p.iconLabel}</div>
              <div className={styles.iconGrid}>
                {ICONS.map(ic => (
                  <button key={ic} className={`${styles.iconBtn} ${newIcon === ic ? styles.iconBtnActive : ''}`} onClick={() => setNewIcon(ic)}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalLabel}>{p.colorLabel}</div>
              <div className={styles.colorGrid}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    className={`${styles.colorBtn} ${newColor === c ? styles.colorBtnActive : ''}`}
                    style={{ background: c }}
                    onClick={() => setNewColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className={styles.modalSection}>
              <input
                ref={nameRef}
                className={styles.modalInput}
                placeholder={p.namePlaceholder}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              <input
                className={styles.modalInput}
                placeholder={p.descPlaceholder}
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>

            {/* PREVIEW */}
            <div className={styles.previewCard} style={{ borderColor: `${newColor}50`, background: `${newColor}0a` }}>
              <span style={{ fontSize: 22 }}>{newIcon}</span>
              <span className={styles.previewName}>{newName || p.namePlaceholder}</span>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setCreating(false)}>{p.cancel}</button>
              <button className={styles.createBtn} onClick={handleCreate} disabled={!newName.trim()} style={{ background: `linear-gradient(135deg, ${newColor}, ${newColor}cc)` }}>
                {p.create}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDelete && (
        <div className={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmIcon}>🗑️</div>
            <div className={styles.confirmTitle}>{p.deleteConfirm}</div>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>{p.cancel}</button>
              <button className={styles.deleteBtnRed} onClick={() => handleDeleteConfirm(confirmDelete)}>{p.delete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

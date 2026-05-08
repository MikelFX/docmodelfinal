'use client'

import { useMemo, useState } from 'react'
import type { ProjectDocument } from '@/lib/types'
import styles from './KnowledgeGraph.module.css'

const STOP = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','may','might','shall','must','can','it','this','that','these','those','i','we','you','he','she','they','my','our','your','his','her','their','its','not','no','from','by','as','if','then','so','about','which','who','how','what','when','where','why','je','a','v','na','se','ze','do','od','po','pro','přes','za','bez','jako','tak','že','ale','nebo','ani','aby','ten','ta','to','ti','ty','který','která','které','být','mít','moci','při','jde','jsou','byl','bylo','byla','jeho','její','jejich','také','více','mezi','před','když','všechny','všech','každý','každá','každé','lze','není','jsou','bude','může'])

function extractKeywords(text: string, topN = 40): string[] {
  const words = text.toLowerCase().slice(0, 4000).split(/\W+/).filter(w => w.length > 3 && !STOP.has(w))
  const freq = new Map<string, number>()
  words.forEach(w => freq.set(w, (freq.get(w) ?? 0) + 1))
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, topN).map(([w]) => w)
}

function getShared(a: string[], b: string[]): string[] {
  const setB = new Set(b)
  return a.filter(w => setB.has(w))
}

function getDocSource(doc: ProjectDocument): string {
  const analysisText = doc.analyses.map(a => a.result.replace(/<[^>]+>/g, ' ')).join(' ')
  return (analysisText + ' ' + doc.content).slice(0, 4000)
}

const W = 920, H = 520
const NW = 124, NH = 76

function getPositions(n: number): {x: number, y: number}[] {
  const cx = W / 2, cy = H / 2
  if (n === 1) return [{x: cx, y: cy}]
  if (n === 2) return [{x: cx - 220, y: cy}, {x: cx + 220, y: cy}]
  if (n === 3) return [{x: cx, y: cy - 155}, {x: cx - 200, y: cy + 105}, {x: cx + 200, y: cy + 105}]
  if (n === 4) return [{x: cx - 215, y: cy - 120}, {x: cx + 215, y: cy - 120}, {x: cx - 215, y: cy + 120}, {x: cx + 215, y: cy + 120}]
  const r = Math.min(W * 0.34, H * 0.34)
  return Array.from({length: n}, (_, i) => ({
    x: cx + r * Math.cos((2 * Math.PI * i / n) - Math.PI / 2),
    y: cy + r * Math.sin((2 * Math.PI * i / n) - Math.PI / 2),
  }))
}

function bezier(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const curve = len * 0.18
  const nx = -dy / len, ny = dx / len
  return `M${x1},${y1} Q${mx + nx * curve},${my + ny * curve} ${x2},${y2}`
}

const STARS = Array.from({length: 90}, (_, i) => ({
  x: ((i * 211 + i * i * 13) % W),
  y: ((i * 149 + i * 7) % H),
  r: i % 4 === 0 ? 1.3 : 0.65,
  op: 0.05 + (i % 8) * 0.018,
}))

interface Edge { a: string; b: string; strength: number; shared: string[]; x1: number; y1: number; x2: number; y2: number }
interface Node { id: string; name: string; fullName: string; x: number; y: number; analysesCount: number; keywords: string[] }
interface Props { documents: ProjectDocument[]; onSelectDoc?: (id: string) => void }

const PFX = 'kg'

export default function KnowledgeGraph({ documents, onSelectDoc }: Props) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null)

  const { nodes, edges } = useMemo(() => {
    if (documents.length === 0) return { nodes: [] as Node[], edges: [] as Edge[] }
    const keywords = documents.map(d => extractKeywords(getDocSource(d)))
    const positions = getPositions(documents.length)
    const nodes: Node[] = documents.map((d, i) => ({
      id: d.id,
      name: d.name.length > 18 ? d.name.slice(0, 16) + '…' : d.name,
      fullName: d.name,
      x: positions[i].x,
      y: positions[i].y,
      analysesCount: d.analyses.length,
      keywords: keywords[i],
    }))
    const edges: Edge[] = []
    for (let i = 0; i < documents.length; i++) {
      for (let j = i + 1; j < documents.length; j++) {
        const shared = getShared(keywords[i], keywords[j])
        const union = new Set([...keywords[i], ...keywords[j]]).size
        const strength = union === 0 ? 0 : shared.length / union
        edges.push({ a: documents[i].id, b: documents[j].id, strength, shared: shared.slice(0, 12), x1: nodes[i].x, y1: nodes[i].y, x2: nodes[j].x, y2: nodes[j].y })
      }
    }
    return { nodes, edges }
  }, [documents])

  const nodeMap = useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes])
  const eKey = (e: Edge) => `${e.a}-${e.b}`

  function edgeColor(s: number) {
    if (s > 0.3) return 'rgba(167,139,250,0.75)'
    if (s > 0.15) return 'rgba(127,119,221,0.55)'
    return 'rgba(127,119,221,0.25)'
  }

  if (documents.length === 0) return null

  const hovNode = hoveredNode ? nodeMap[hoveredNode] : null
  const selEdge = selectedEdge

  return (
    <div className={styles.wrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`${PFX}bg`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(127,119,221,0.05)" />
            <stop offset="100%" stopColor="rgba(7,7,13,0)" />
          </radialGradient>
          <radialGradient id={`${PFX}card`} cx="50%" cy="20%" r="90%">
            <stop offset="0%" stopColor="rgba(45,40,90,0.97)" />
            <stop offset="100%" stopColor="rgba(11,10,24,0.99)" />
          </radialGradient>
          <radialGradient id={`${PFX}cardh`} cx="50%" cy="20%" r="90%">
            <stop offset="0%" stopColor="rgba(70,58,140,0.99)" />
            <stop offset="100%" stopColor="rgba(16,13,36,0.99)" />
          </radialGradient>
          <radialGradient id={`${PFX}shadow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(127,119,221,0.3)" />
            <stop offset="100%" stopColor="rgba(127,119,221,0)" />
          </radialGradient>
          <filter id={`${PFX}eglow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id={`${PFX}nglow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {edges.filter(e => e.strength > 0.05).map(e => (
            <path key={`d${eKey(e)}`} id={`${PFX}p${eKey(e)}`} d={bezier(e.x1, e.y1, e.x2, e.y2)} />
          ))}
        </defs>

        {/* Background */}
        <rect x="0" y="0" width={W} height={H} fill={`url(#${PFX}bg)`} />
        {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.op} />)}

        {/* EDGES */}
        {edges.map(e => {
          const key = eKey(e)
          const isHov = hoveredEdge === key
          const isSel = selEdge && eKey(selEdge) === key
          const isRel = hoveredNode === e.a || hoveredNode === e.b
          const hl = isHov || isSel || isRel
          const hasConn = e.strength > 0.05
          const pd = bezier(e.x1, e.y1, e.x2, e.y2)
          const ew = Math.max(1, e.strength * 7)

          return (
            <g key={key}>
              {hasConn ? (
                <>
                  {hl && <path d={pd} stroke="rgba(167,139,250,0.25)" strokeWidth={ew + 5} fill="none" filter={`url(#${PFX}eglow)`} />}
                  <path d={pd} stroke={hl ? 'rgba(167,139,250,0.95)' : edgeColor(e.strength)} strokeWidth={hl ? ew + 1 : ew} fill="none" strokeLinecap="round" style={{transition:'stroke 0.2s,stroke-width 0.2s'}} />
                  {e.strength > 0.08 && (
                    <circle r="3" fill={hl ? 'rgba(220,210,255,0.95)' : 'rgba(167,139,250,0.7)'}>
                      <animateMotion dur={`${2.5 + (1 - e.strength) * 4}s`} repeatCount="indefinite">
                        <mpath href={`#${PFX}p${key}`} />
                      </animateMotion>
                    </circle>
                  )}
                  {(isHov || isSel) && (
                    <g transform={`translate(${(e.x1+e.x2)/2},${(e.y1+e.y2)/2})`}>
                      <rect x="-30" y="-14" width="60" height="22" rx="7" fill="rgba(9,8,22,0.97)" stroke="rgba(127,119,221,0.45)" strokeWidth="0.7"/>
                      <text textAnchor="middle" dy="4" fontSize="10.5" fill="#AFA9EC" fontWeight="600">{Math.round(e.strength * 100)}% shoda</text>
                    </g>
                  )}
                </>
              ) : (
                <path d={pd} stroke="rgba(127,119,221,0.07)" strokeWidth={0.7} fill="none" strokeDasharray="4 9" />
              )}
              <path d={pd} stroke="transparent" strokeWidth={22} fill="none" style={{cursor: hasConn ? 'pointer' : 'default'}}
                onMouseEnter={() => setHoveredEdge(key)} onMouseLeave={() => setHoveredEdge(null)}
                onClick={() => hasConn && setSelectedEdge(isSel ? null : e)} />
            </g>
          )
        })}

        {/* NODES */}
        {nodes.map((node, i) => {
          const isHov = hoveredNode === node.id
          const hw = NW / 2, hh = NH / 2
          const delay = `${i * 0.6}s`

          return (
            <g key={node.id} transform={`translate(${node.x},${node.y})`}
              onClick={() => { onSelectDoc?.(node.id); setSelectedEdge(null) }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{cursor: 'pointer'}}
            >
              {/* Shadow beneath — stays at base position */}
              <ellipse cx={0} cy={hh + 18} rx={hw * 0.65} ry={7}
                fill={`url(#${PFX}shadow)`} opacity={isHov ? 0.7 : 0.35}
                style={{transition:'opacity 0.25s'}} />

              {/* Floating card group */}
              <g className={styles.nodeFloat} style={{animationDelay: delay} as React.CSSProperties}>
                {/* Outer glow on hover */}
                {isHov && (
                  <rect x={-hw - 10} y={-hh - 10} width={NW + 20} height={NH + 20} rx="18"
                    fill="rgba(127,119,221,0.07)" filter={`url(#${PFX}nglow)`} />
                )}
                {/* Card */}
                <rect x={-hw} y={-hh} width={NW} height={NH} rx="13"
                  fill={`url(#${PFX}${isHov ? 'cardh' : 'card'})`}
                  stroke={isHov ? 'rgba(167,139,250,0.7)' : 'rgba(127,119,221,0.28)'}
                  strokeWidth={isHov ? 1.5 : 1}
                  style={{transition:'stroke 0.2s,stroke-width 0.2s'}} />
                {/* Top accent bar */}
                <rect x={-hw + 5} y={-hh + 4} width={NW - 10} height={2.5} rx="1.5"
                  fill={isHov ? 'rgba(167,139,250,0.45)' : 'rgba(127,119,221,0.18)'}
                  style={{transition:'fill 0.2s'}} />
                {/* Doc icon */}
                <text textAnchor="middle" dy="-6" fontSize="19" style={{userSelect:'none',pointerEvents:'none'}}>📄</text>
                {/* Name */}
                <text textAnchor="middle" dy="11" fontSize="11.5"
                  fontWeight={isHov ? '600' : '500'}
                  fill={isHov ? '#ede9ff' : '#b8b4d8'}
                  style={{userSelect:'none',pointerEvents:'none',transition:'fill 0.2s'}}>
                  {node.name}
                </text>
                {/* Analyses count */}
                <text textAnchor="middle" dy="25" fontSize="9.5"
                  fill={node.analysesCount > 0 ? 'rgba(127,119,221,0.6)' : 'rgba(70,65,100,0.55)'}
                  style={{userSelect:'none',pointerEvents:'none'}}>
                  {node.analysesCount > 0 ? `${node.analysesCount} analýz` : 'bez analýz'}
                </text>
              </g>
            </g>
          )
        })}
      </svg>

      {/* EDGE INFO PANEL */}
      {selEdge && (
        <div className={styles.panel}>
          <div className={styles.panelRow}>
            <div className={styles.panelDocs}>
              <span className={styles.panelDocName}>{nodeMap[selEdge.a]?.name}</span>
              <span className={styles.panelArrow}>↔</span>
              <span className={styles.panelDocName}>{nodeMap[selEdge.b]?.name}</span>
            </div>
            <div className={styles.panelStrengthWrap}>
              <div className={styles.panelStrengthTrack}>
                <div className={styles.panelStrengthFill} style={{width:`${Math.round(selEdge.strength * 100)}%`}} />
              </div>
              <span className={styles.panelStrengthLabel}>{Math.round(selEdge.strength * 100)}% shoda</span>
            </div>
          </div>
          {selEdge.shared.length > 0 ? (
            <>
              <div className={styles.panelSectionLabel}>Společná témata</div>
              <div className={styles.panelKeywords}>
                {selEdge.shared.map(k => <span key={k} className={styles.keyword}>{k}</span>)}
              </div>
            </>
          ) : (
            <div className={styles.panelEmpty}>Dokumenty nesdílejí společná témata</div>
          )}
          <button className={styles.panelClose} onClick={() => setSelectedEdge(null)}>×</button>
        </div>
      )}

      {/* NODE HOVER PANEL */}
      {hovNode && !selEdge && (
        <div className={styles.nodePanel}>
          <div className={styles.panelSectionLabel}>{hovNode.fullName}</div>
          <div className={styles.panelKeywords}>
            {hovNode.keywords.slice(0, 10).map(k => <span key={k} className={styles.keyword}>{k}</span>)}
          </div>
          <div className={styles.nodePanelHint}>Klikni pro otevření dokumentu →</div>
        </div>
      )}

      {!selEdge && !hovNode && (
        <div className={styles.hint}>
          {edges.some(e => e.strength > 0.05)
            ? 'Klikni na spojnici pro témata · Klikni na dokument pro otevření'
            : 'Spusť analýzy pro zobrazení propojení mezi dokumenty'}
        </div>
      )}
    </div>
  )
}

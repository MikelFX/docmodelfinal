'use client'

import { useMemo, useState } from 'react'
import type { ProjectDocument } from '@/lib/types'
import styles from './KnowledgeGraph.module.css'

interface Props {
  documents: ProjectDocument[]
  activeDocId?: string
  onSelectDoc?: (id: string) => void
}

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

const W = 560
const H = 340
const CX = W / 2
const CY = H / 2
const R = 120

interface Edge {
  a: string; b: string
  strength: number
  shared: string[]
  x1: number; y1: number; x2: number; y2: number
}

interface Node {
  id: string; name: string; fullName: string
  x: number; y: number
  analysesCount: number
  keywords: string[]
}

export default function KnowledgeGraph({ documents, activeDocId, onSelectDoc }: Props) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null)

  const { nodes, edges } = useMemo(() => {
    if (documents.length === 0) return { nodes: [] as Node[], edges: [] as Edge[] }

    const keywords = documents.map(d => extractKeywords(getDocSource(d)))

    const angle = (i: number) => (2 * Math.PI * i) / documents.length - Math.PI / 2
    const nodes: Node[] = documents.map((d, i) => ({
      id: d.id,
      name: d.name.length > 16 ? d.name.slice(0, 14) + '…' : d.name,
      fullName: d.name,
      x: documents.length === 1 ? CX : CX + R * Math.cos(angle(i)),
      y: documents.length === 1 ? CY : CY + R * Math.sin(angle(i)),
      analysesCount: d.analyses.length,
      keywords: keywords[i],
    }))

    const edges: Edge[] = []
    for (let i = 0; i < documents.length; i++) {
      for (let j = i + 1; j < documents.length; j++) {
        const shared = getShared(keywords[i], keywords[j])
        const union = new Set([...keywords[i], ...keywords[j]]).size
        const strength = union === 0 ? 0 : shared.length / union
        edges.push({
          a: documents[i].id,
          b: documents[j].id,
          strength,
          shared: shared.slice(0, 10),
          x1: nodes[i].x, y1: nodes[i].y,
          x2: nodes[j].x, y2: nodes[j].y,
        })
      }
    }
    return { nodes, edges }
  }, [documents])

  const nodeMap = useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes])

  const edgeKey = (e: Edge) => `${e.a}-${e.b}`

  function edgeColor(strength: number): string {
    if (strength > 0.3) return 'rgba(127,119,221,0.75)'
    if (strength > 0.15) return 'rgba(127,119,221,0.45)'
    return 'rgba(127,119,221,0.2)'
  }

  function edgeWidth(strength: number): number {
    return Math.max(0.8, strength * 6)
  }

  if (documents.length === 0) return null

  return (
    <div className={styles.wrap}>
      {/* GRAPH SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg}>
        <defs>
          <radialGradient id="ng" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="rgba(127,119,221,0.45)" />
            <stop offset="100%" stopColor="rgba(127,119,221,0.1)" />
          </radialGradient>
          <radialGradient id="nga" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="rgba(167,139,250,0.95)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0.55)" />
          </radialGradient>
          <radialGradient id="ngh" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="rgba(127,119,221,0.65)" />
            <stop offset="100%" stopColor="rgba(127,119,221,0.2)" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* EDGES */}
        {edges.map(e => {
          const key = edgeKey(e)
          const isSelected = selectedEdge && edgeKey(selectedEdge) === key
          const isHov = hoveredEdge === key
          const isRelated = hoveredNode === e.a || hoveredNode === e.b
          const isActive = activeDocId === e.a || activeDocId === e.b
          const highlight = isSelected || isHov || isRelated || isActive
          const hasConnection = e.strength > 0.04

          return (
            <g key={key}>
              {hasConnection ? (
                <line
                  x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                  stroke={highlight ? 'rgba(167,139,250,0.8)' : edgeColor(e.strength)}
                  strokeWidth={highlight ? edgeWidth(e.strength) + 1 : edgeWidth(e.strength)}
                  strokeDasharray={e.strength < 0.12 ? '5 5' : 'none'}
                  style={{ transition: 'all 0.22s ease' }}
                />
              ) : (
                <line
                  x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                  stroke="rgba(127,119,221,0.08)"
                  strokeWidth={0.5}
                  strokeDasharray="3 8"
                />
              )}
              {/* Invisible thick hit area */}
              <line
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke="transparent" strokeWidth={16}
                style={{ cursor: hasConnection ? 'pointer' : 'default' }}
                onMouseEnter={() => setHoveredEdge(key)}
                onMouseLeave={() => setHoveredEdge(null)}
                onClick={() => hasConnection && setSelectedEdge(isSelected ? null : e)}
              />
              {/* Strength label on hover */}
              {(isHov || isSelected) && hasConnection && (
                <g transform={`translate(${(e.x1 + e.x2) / 2},${(e.y1 + e.y2) / 2})`}>
                  <rect x="-24" y="-12" width="48" height="18" rx="5"
                    fill="rgba(11,10,22,0.96)" stroke="rgba(127,119,221,0.35)" strokeWidth="0.5" />
                  <text textAnchor="middle" dy="3" fontSize="9.5" fill="#AFA9EC" fontWeight="600">
                    {Math.round(e.strength * 100)}% shoda
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* NODES */}
        {nodes.map(node => {
          const isActive = node.id === activeDocId
          const isHov = node.id === hoveredNode
          const r = Math.min(38, 22 + node.analysesCount * 3)

          return (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              style={{ cursor: 'pointer' }}
              onClick={() => { onSelectDoc?.(node.id); setSelectedEdge(null) }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* outer glow ring */}
              {(isActive || isHov) && (
                <circle r={r + 10}
                  fill={isActive ? 'rgba(127,119,221,0.1)' : 'rgba(127,119,221,0.06)'}
                  style={{ transition: 'all 0.2s' }}
                />
              )}
              {/* main circle */}
              <circle
                r={r}
                fill={isActive ? 'url(#nga)' : isHov ? 'url(#ngh)' : 'url(#ng)'}
                stroke={isActive ? '#a78bfa' : isHov ? 'rgba(127,119,221,0.6)' : 'rgba(127,119,221,0.22)'}
                strokeWidth={isActive ? 1.5 : 1}
                filter={isActive ? 'url(#glow)' : isHov ? 'url(#softGlow)' : undefined}
                style={{ transition: 'all 0.2s' }}
              />
              {/* doc icon */}
              <text textAnchor="middle" dy="-5" fontSize="14" style={{ userSelect: 'none', pointerEvents: 'none' }}>
                📄
              </text>
              {/* name */}
              <text
                textAnchor="middle"
                dy="9"
                fontSize="9.5"
                fontWeight={isActive ? '600' : '500'}
                fill={isActive ? '#f0eeff' : isHov ? '#c8c4e8' : '#7a76a8'}
                style={{ userSelect: 'none', transition: 'fill 0.2s', pointerEvents: 'none' }}
              >
                {node.name}
              </text>
              {/* analyses badge */}
              {node.analysesCount > 0 && (
                <text textAnchor="middle" dy="21" fontSize="8" fill="rgba(127,119,221,0.55)"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}>
                  {node.analysesCount} analýz
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* INFO PANEL — selected edge */}
      {selectedEdge && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelDocs}>
              <span className={styles.panelDocName}>{nodeMap[selectedEdge.a]?.name}</span>
              <span className={styles.panelArrow}>↔</span>
              <span className={styles.panelDocName}>{nodeMap[selectedEdge.b]?.name}</span>
            </div>
            <div className={styles.panelStrength}>
              <div
                className={styles.panelStrengthBar}
                style={{ width: `${Math.round(selectedEdge.strength * 100)}%` }}
              />
              <span>{Math.round(selectedEdge.strength * 100)}% shoda</span>
            </div>
          </div>
          <div className={styles.panelBody}>
            {selectedEdge.shared.length > 0 ? (
              <>
                <div className={styles.panelLabel}>Sdílená témata</div>
                <div className={styles.panelKeywords}>
                  {selectedEdge.shared.map(k => (
                    <span key={k} className={styles.keyword}>{k}</span>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.panelEmpty}>Dokumenty nesdílejí společná témata.</div>
            )}
          </div>
          <button className={styles.panelClose} onClick={() => setSelectedEdge(null)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* HINT when no edge selected */}
      {!selectedEdge && edges.some(e => e.strength > 0.04) && (
        <div className={styles.hint}>
          Klikni na spojnici mezi dokumenty pro zobrazení společných témat
        </div>
      )}

      {/* NO CONNECTIONS */}
      {edges.length > 0 && edges.every(e => e.strength <= 0.04) && (
        <div className={styles.hint}>
          Dokumenty nemají společná témata — pravděpodobně pokrývají odlišné oblasti
        </div>
      )}

      {/* NODE KEYWORDS TOOLTIP */}
      {hoveredNode && !selectedEdge && (
        <div className={styles.nodePanel}>
          <div className={styles.panelLabel}>Klíčová témata — {nodeMap[hoveredNode]?.fullName}</div>
          <div className={styles.panelKeywords}>
            {(nodeMap[hoveredNode]?.keywords ?? []).slice(0, 8).map(k => (
              <span key={k} className={styles.keyword}>{k}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

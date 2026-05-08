'use client'

import { useMemo, useState } from 'react'
import type { ProjectDocument } from '@/lib/types'
import styles from './KnowledgeGraph.module.css'

interface Props {
  documents: ProjectDocument[]
  activeDocId?: string
  onSelectDoc?: (id: string) => void
}

const STOP = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','may','might','shall','must','can','it','this','that','these','those','i','we','you','he','she','they','my','our','your','his','her','their','its','not','no','from','by','as','if','then','so','about','which','who','how','what','when','where','why','je','a','v','na','se','ze','do','od','po','pro','přes','za','bez','jako','tak','že','ale','nebo','ani','aby','ten','ta','to','ti','ty','který','která','které','být','mít','moci','při','jde','jsou','byl','bylo','byla','jeho','její','jejich'])

function extractKeywords(text: string): Set<string> {
  const words = text.toLowerCase().slice(0, 2000).split(/\W+/).filter(w => w.length > 3 && !STOP.has(w))
  const freq = new Map<string, number>()
  words.forEach(w => freq.set(w, (freq.get(w) ?? 0) + 1))
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)
  return new Set(sorted.map(([w]) => w))
}

function similarity(a: Set<string>, b: Set<string>): number {
  let inter = 0
  for (const w of a) if (b.has(w)) inter++
  const union = new Set([...a, ...b]).size
  return union === 0 ? 0 : inter / union
}

function getDocSource(doc: ProjectDocument): string {
  if (doc.analyses.length > 0) return doc.analyses[0].result.slice(0, 800)
  return doc.content.slice(0, 800)
}

const W = 580
const H = 380
const CX = W / 2
const CY = H / 2
const R = 130

export default function KnowledgeGraph({ documents, activeDocId, onSelectDoc }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)

  const { nodes, edges } = useMemo(() => {
    if (documents.length === 0) return { nodes: [], edges: [] }

    const keywords = documents.map(d => extractKeywords(getDocSource(d)))

    const angle = (i: number) => (2 * Math.PI * i) / documents.length - Math.PI / 2
    const nodes = documents.map((d, i) => ({
      id: d.id,
      name: d.name.length > 18 ? d.name.slice(0, 16) + '…' : d.name,
      fullName: d.name,
      x: documents.length === 1 ? CX : CX + R * Math.cos(angle(i)),
      y: documents.length === 1 ? CY : CY + R * Math.sin(angle(i)),
      analysesCount: d.analyses.length,
    }))

    const edges: { a: string; b: string; strength: number; x1: number; y1: number; x2: number; y2: number }[] = []
    for (let i = 0; i < documents.length; i++) {
      for (let j = i + 1; j < documents.length; j++) {
        const s = similarity(keywords[i], keywords[j])
        if (s > 0.12) {
          edges.push({
            a: documents[i].id,
            b: documents[j].id,
            strength: s,
            x1: nodes[i].x,
            y1: nodes[i].y,
            x2: nodes[j].x,
            y2: nodes[j].y,
          })
        }
      }
    }
    return { nodes, edges }
  }, [documents])

  if (documents.length === 0) return null

  function handleEdgeHover(e: React.MouseEvent, edge: typeof edges[0]) {
    const rect = (e.currentTarget as SVGElement).closest('svg')!.getBoundingClientRect()
    const mx = (edge.x1 + edge.x2) / 2
    const my = (edge.y1 + edge.y2) / 2
    setTooltip({ x: mx, y: my - 18, text: `${Math.round(edge.strength * 100)}% match` })
  }

  return (
    <div className={styles.wrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg}>
        <defs>
          <radialGradient id="nodeGrad" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="rgba(127,119,221,0.5)" />
            <stop offset="100%" stopColor="rgba(127,119,221,0.12)" />
          </radialGradient>
          <radialGradient id="nodeGradActive" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="rgba(127,119,221,0.9)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0.5)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* edges */}
        {edges.map((e, i) => {
          const isHot = hovered === e.a || hovered === e.b
          return (
            <g key={i}>
              <line
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke={isHot ? 'rgba(127,119,221,0.55)' : 'rgba(127,119,221,0.2)'}
                strokeWidth={isHot ? 1.5 : 0.8}
                strokeDasharray={e.strength < 0.2 ? '4 4' : 'none'}
                style={{ transition: 'all 0.2s' }}
              />
              <line
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke="transparent" strokeWidth={12}
                style={{ cursor: 'default' }}
                onMouseEnter={ev => handleEdgeHover(ev, e)}
                onMouseLeave={() => setTooltip(null)}
              />
            </g>
          )
        })}

        {/* nodes */}
        {nodes.map(node => {
          const isActive = node.id === activeDocId
          const isHov = node.id === hovered
          const r = 28 + node.analysesCount * 2
          return (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectDoc?.(node.id)}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <circle
                r={r + 8}
                fill="transparent"
              />
              {isHov && <circle r={r + 4} fill="rgba(127,119,221,0.08)" style={{ transition: 'r 0.2s' }} />}
              <circle
                r={r}
                fill={isActive ? 'url(#nodeGradActive)' : 'url(#nodeGrad)'}
                stroke={isActive ? '#7F77DD' : isHov ? 'rgba(127,119,221,0.5)' : 'rgba(127,119,221,0.2)'}
                strokeWidth={isActive ? 1.5 : 0.8}
                filter={isActive ? 'url(#glow)' : undefined}
                style={{ transition: 'all 0.2s' }}
              />
              <text
                textAnchor="middle"
                dy="-3"
                fontSize="11"
                fill={isActive ? '#f0eeff' : '#8a86b8'}
                style={{ userSelect: 'none', transition: 'fill 0.2s', pointerEvents: 'none' }}
              >
                {node.name.length > 14 ? node.name.slice(0, 13) + '…' : node.name}
              </text>
              {node.analysesCount > 0 && (
                <text textAnchor="middle" dy="11" fontSize="9" fill="rgba(127,119,221,0.6)" style={{ userSelect: 'none', pointerEvents: 'none' }}>
                  {node.analysesCount} analýz
                </text>
              )}
            </g>
          )
        })}

        {/* tooltip */}
        {tooltip && (
          <g transform={`translate(${tooltip.x},${tooltip.y})`}>
            <rect x="-28" y="-14" width="56" height="18" rx="4" fill="rgba(13,11,24,0.95)" stroke="rgba(127,119,221,0.3)" strokeWidth="0.5" />
            <text textAnchor="middle" dy="0" fontSize="10" fill="#AFA9EC">{tooltip.text}</text>
          </g>
        )}
      </svg>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendLine} />
          <span>Similar content</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDash} />
          <span>Weak connection</span>
        </div>
      </div>
    </div>
  )
}

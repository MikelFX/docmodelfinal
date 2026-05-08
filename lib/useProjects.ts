'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import type { Project, ProjectDocument, DocumentAnalysis } from './types'

function getKey(userId: string | null | undefined) {
  return userId ? `docthink_projects_${userId}` : null
}

function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

export function useProjects() {
  const { userId } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!userId) return
    try {
      const key = getKey(userId)!
      const raw = localStorage.getItem(key)
      if (raw) setProjects(JSON.parse(raw))
      else setProjects([])
    } catch {}
    setLoaded(true)
  }, [userId])

  function persist(updated: Project[]) {
    const key = getKey(userId)
    if (!key) return
    setProjects(updated)
    try { localStorage.setItem(key, JSON.stringify(updated)) } catch {}
  }

  function createProject(name: string, description: string, icon: string, color: string): Project {
    const p: Project = {
      id: uid(), name, description, icon, color,
      createdAt: Date.now(), updatedAt: Date.now(),
      documents: [], memoryContext: '', tags: [],
    }
    persist([...projects, p])
    return p
  }

  function updateProject(id: string, updates: Partial<Project>) {
    persist(projects.map(p => p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p))
  }

  function deleteProject(id: string) {
    persist(projects.filter(p => p.id !== id))
  }

  function addDocument(projectId: string, doc: Pick<ProjectDocument, 'name' | 'content' | 'size' | 'type'>): ProjectDocument {
    const d: ProjectDocument = { ...doc, id: uid(), uploadedAt: Date.now(), analyses: [] }
    persist(projects.map(p =>
      p.id !== projectId ? p : { ...p, documents: [...p.documents, d], updatedAt: Date.now() }
    ))
    return d
  }

  function removeDocument(projectId: string, docId: string) {
    persist(projects.map(p =>
      p.id !== projectId ? p : { ...p, updatedAt: Date.now(), documents: p.documents.filter(d => d.id !== docId) }
    ))
  }

  function addAnalysis(projectId: string, docId: string, analysis: Pick<DocumentAnalysis, 'mode' | 'result'>) {
    const a: DocumentAnalysis = { ...analysis, id: uid(), createdAt: Date.now() }
    persist(projects.map(p => {
      if (p.id !== projectId) return p
      return {
        ...p, updatedAt: Date.now(),
        documents: p.documents.map(d =>
          d.id !== docId ? d : { ...d, analyses: [a, ...d.analyses].slice(0, 10) }
        ),
      }
    }))
  }

  function getProject(id: string) {
    return projects.find(p => p.id === id)
  }

  return { projects, loaded, createProject, updateProject, deleteProject, addDocument, removeDocument, addAnalysis, getProject }
}

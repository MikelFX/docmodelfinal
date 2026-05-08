'use client'

import { useRouter } from 'next/navigation'
import Analyzer from '@/components/Analyzer'
import { useProjects } from '@/lib/useProjects'

export default function QuickPage() {
  const router = useRouter()
  const { projects, loaded, addDocument, addAnalysis } = useProjects()

  function handleSaveToProject(projectId: string, content: string, fileName: string, mode: string, result: string) {
    const doc = addDocument(projectId, { name: fileName || 'Dokument', content, size: 0, type: '' })
    addAnalysis(projectId, doc.id, { mode, result })
    router.push(`/app/project/${projectId}`)
  }

  return (
    <Analyzer
      backHref="/app"
      savedProjects={loaded ? projects.map(p => ({ id: p.id, name: p.name, icon: p.icon, color: p.color })) : []}
      onSaveToProject={handleSaveToProject}
    />
  )
}

export interface DocumentAnalysis {
  id: string
  mode: string
  result: string
  createdAt: number
}

export interface ProjectDocument {
  id: string
  name: string
  content: string
  size: number
  type: string
  uploadedAt: number
  analyses: DocumentAnalysis[]
}

export interface Project {
  id: string
  name: string
  description: string
  icon: string
  color: string
  createdAt: number
  updatedAt: number
  documents: ProjectDocument[]
  memoryContext: string
  tags: string[]
}

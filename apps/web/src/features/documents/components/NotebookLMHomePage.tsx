'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, FileText } from 'lucide-react'
import { useDocumentsStore } from '../stores/documentsStore'
import { useGuestDocumentsStore } from '../stores/guestDocumentsStore'
import { NotebookLMProjectView } from './NotebookLMProjectView'

interface NotebookLMHomePageProps {
  authToken?: string
  isGuest?: boolean
}

interface Project {
  id: string
  title: string
  sourceCount: number
  lastModified: Date
}

const BACKGROUND_COLORS = [
  'bg-amber-50',
  'bg-pink-50',
  'bg-blue-50',
  'bg-purple-50',
  'bg-green-50',
  'bg-orange-50',
  'bg-cyan-50',
  'bg-rose-50',
]

type TabType = '最近' | '共有' | 'タイトル' | 'ダウンロード済み'

export function NotebookLMHomePage({ authToken, isGuest = false }: NotebookLMHomePageProps) {
  const { collections: authCollections, fetchCollections, createCollection: createAuthCollection } = useDocumentsStore()
  const { collections: guestCollections, addCollection: addGuestCollection } = useGuestDocumentsStore()
  const [activeTab, setActiveTab] = useState<TabType>('最近')
  const [projects, setProjects] = useState<Project[]>([])
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // Determine which collections to use
  const collections = authToken ? authCollections : guestCollections

  useEffect(() => {
    if (authToken) {
      fetchCollections(authToken)
    }
  }, [authToken, fetchCollections])

  useEffect(() => {
    // Convert collections to projects
    const projectList: Project[] = collections.map((col) => ({
      id: col.id,
      title: col.name,
      sourceCount: (col as any).documentCount || 0,
      lastModified: new Date((col as any).updatedAt || col.createdAt),
    }))
    setProjects(projectList)
  }, [collections])

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return

    try {
      if (authToken) {
        await createAuthCollection(authToken, newProjectTitle.trim())
        await fetchCollections(authToken)
      } else {
        addGuestCollection(newProjectTitle.trim())
      }
      setNewProjectTitle('')
      setShowNewProjectModal(false)
    } catch (error: any) {
      console.error('[NotebookLM] Error creating project:', error)
      alert(`プロジェクトの作成に失敗しました: ${error.message}`)
    }
  }

  const tabs: TabType[] = ['最近', '共有', 'タイトル', 'ダウンロード済み']

  // If a project is selected, show project detail view
  if (selectedProject) {
    return (
      <NotebookLMProjectView
        projectId={selectedProject}
        authToken={authToken}
        isGuest={isGuest}
        onBack={() => setSelectedProject(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor"/>
            </svg>
            <h1 className="text-xl font-semibold">NotebookLM</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              PRO
            </span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 border-2 border-white">
              {/* Profile image placeholder */}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-gray-200 px-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* Project Cards */}
      <main className="p-4 pb-24">
        <div className="space-y-3">
          {projects.length > 0 ? (
            projects.map((project, index) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`${BACKGROUND_COLORS[index % BACKGROUND_COLORS.length]} rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {project.sourceCount}件のソース • {formatDate(project.lastModified)}
                      </p>
                    </div>
                  </div>
                  <button
                    className="p-2 hover:bg-white/50 rounded-full transition-colors flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Edit project
                    }}
                  >
                    <Edit2 className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Empty state
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                プロジェクトを作成
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                ソースを追加して、AIに質問してみましょう
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowNewProjectModal(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl hover:bg-gray-800 transition-all flex items-center gap-2 font-medium z-50"
      >
        <Plus className="w-5 h-5" />
        新規作成
      </button>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">新しいノート</h2>
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ノート名
                </label>
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newProjectTitle.trim()) {
                      handleCreateProject()
                    }
                  }}
                  placeholder="例: AI開発プロジェクト"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectTitle.trim()}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Safe Area */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  )
}

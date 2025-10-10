'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  FileText,
  Plus,
  Search,
  Tag,
  MessageCircle,
  Sparkles,
  Edit,
  Trash2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  category: string
  created_at: string
  updated_at: string
}

export default function NotesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showFaroChat, setShowFaroChat] = useState(false)

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: '',
    category: 'finance'
  })

  const categories = [
    { id: 'all', name: 'すべて', color: 'gray' },
    { id: 'finance', name: '資産・投資', color: 'blue' },
    { id: 'tax', name: '税務', color: 'green' },
    { id: 'business', name: 'ビジネス', color: 'purple' },
    { id: 'goals', name: '目標・計画', color: 'orange' },
    { id: 'personal', name: '個人メモ', color: 'pink' }
  ]

  useEffect(() => {
    if (user) {
      loadNotes()
    }
  }, [user])

  const loadNotes = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert('タイトルと内容は必須です')
      return
    }

    try {
      const supabase = createClient()

      const noteData = {
        user_id: user?.id,
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags.split(',').map((t) => t.trim()).filter(Boolean),
        category: newNote.category,
        is_private: true,
        metadata: {}
      }

      if (editingNote) {
        // Update existing note
        const { error } = await supabase
          .from('user_notes')
          .update(noteData)
          .eq('id', editingNote.id)

        if (error) throw error
      } else {
        // Create new note
        const { error } = await supabase.from('user_notes').insert(noteData)
        if (error) throw error
      }

      setShowAddModal(false)
      setEditingNote(null)
      setNewNote({ title: '', content: '', tags: '', category: 'finance' })
      loadNotes()
    } catch (error) {
      console.error('Error saving note:', error)
      alert('ノートの保存に失敗しました')
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setNewNote({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
      category: note.category
    })
    setShowAddModal(true)
  }

  const handleDeleteNote = async (id: string) => {
    if (!confirm('このノートを削除しますか？')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('user_notes').delete().eq('id', id)

      if (error) throw error
      loadNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('削除に失敗しました')
    }
  }

  const filteredNotes = notes.filter((note) => {
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/workspace-new')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Workspace</span>
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">ノート</h1>
            </div>
          </div>

          <Button
            onClick={() => {
              setEditingNote(null)
              setNewNote({ title: '', content: '', tags: '', category: 'finance' })
              setShowAddModal(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>新規作成</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ノートを検索..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? `bg-${cat.color}-600 text-white`
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
                style={{
                  backgroundColor: selectedCategory === cat.id ? getCategoryColor(cat.color) : undefined
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2">
                {searchQuery
                  ? '検索結果が見つかりませんでした'
                  : 'まだノートがありません'}
              </p>
              <p className="text-sm text-gray-400">
                {searchQuery
                  ? '別のキーワードで検索してみてください'
                  : '新規作成ボタンからノートを作成しましょう'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card
                key={note.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    {note.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{
                        backgroundColor: getCategoryColor(
                          categories.find((c) => c.id === note.category)?.color || 'gray'
                        )
                      }}
                    >
                      {categories.find((c) => c.id === note.category)?.name}
                    </span>
                    {note.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        {note.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                          >
                            #{tag}
                          </span>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="text-xs text-gray-400">+{note.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{note.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(note.updated_at).toLocaleDateString('ja-JP')}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                        className="hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingNote ? 'ノートを編集' : '新しいノート'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="ノートのタイトル"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリー
                </label>
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  {categories
                    .filter((c) => c.id !== 'all')
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="ノートの内容を入力..."
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タグ（カンマ区切り）
                </label>
                <input
                  type="text"
                  value={newNote.tags}
                  onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                  placeholder="投資, 副業, NISA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false)
                  setEditingNote(null)
                }}
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleAddNote}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {editingNote ? '更新' : '作成'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Faro Button */}
      <button
        onClick={() => setShowFaroChat(!showFaroChat)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 z-50"
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </button>

      {/* Faro Mini Chat */}
      {showFaroChat && (
        <div className="fixed bottom-28 right-8 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Faro</span>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            ノートに記録した内容から、私がアドバイスできることがたくさんありますよ。
          </p>
          <Button
            onClick={() => router.push('/faro')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            詳しく相談する
          </Button>
        </div>
      )}
    </div>
  )
}

function getCategoryColor(color: string): string {
  const colors: Record<string, string> = {
    blue: '#2563eb',
    green: '#16a34a',
    purple: '#9333ea',
    orange: '#ea580c',
    pink: '#ec4899',
    gray: '#6b7280'
  }
  return colors[color] || colors.gray
}

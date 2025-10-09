'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Trash2, Edit3, Save, X, FileText,
  Clock, Tag, Star, MoreHorizontal
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  created_at: Date
  updated_at: Date
  starred: boolean
}

export function NotesApp() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState('')

  useEffect(() => {
    loadNotes()
  }, [user])

  const loadNotes = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/notes?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error('Failed to load notes:', error)
    }
  }

  const createNewNote = () => {
    const newNote: Note = {
      id: `temp-${Date.now()}`,
      title: '新しいノート',
      content: '',
      tags: [],
      created_at: new Date(),
      updated_at: new Date(),
      starred: false
    }
    setSelectedNote(newNote)
    setEditTitle(newNote.title)
    setEditContent(newNote.content)
    setEditTags('')
    setIsEditing(true)
  }

  const saveNote = async () => {
    if (!user || !selectedNote) return

    const noteData = {
      title: editTitle,
      content: editContent,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      userId: user.id
    }

    try {
      const response = await fetch('/api/notes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      })

      if (response.ok) {
        await loadNotes()
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('このノートを削除しますか？')) return

    try {
      await fetch(`/api/notes/${noteId}`, { method: 'DELETE' })
      await loadNotes()
      setSelectedNote(null)
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex bg-black text-white">
      {/* Sidebar - Notes List */}
      <div className="w-80 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-semibold">ノート</h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="ノートを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg outline-none focus:border-violet-500 transition-all text-sm"
            />
          </div>

          <button
            onClick={createNewNote}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-pink-500 rounded-lg hover:from-violet-600 hover:to-pink-600 transition-all font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            新規作成
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.button
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => {
                  setSelectedNote(note)
                  setEditTitle(note.title)
                  setEditContent(note.content)
                  setEditTags(note.tags.join(', '))
                  setIsEditing(false)
                }}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedNote?.id === note.id
                    ? 'bg-violet-500/20 border border-violet-500'
                    : 'bg-gray-900 border border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-sm truncate flex-1">{note.title}</h3>
                  {note.starred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-2">{note.content}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(note.updated_at).toLocaleDateString('ja-JP')}</span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>

          {filteredNotes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">ノートがありません</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className="border-b border-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-xl font-bold bg-transparent border-b-2 border-violet-500 outline-none"
                    placeholder="タイトル"
                  />
                ) : (
                  <h1 className="text-xl font-bold">{selectedNote.title}</h1>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={saveNote}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                      編集
                    </button>
                    <button
                      onClick={() => deleteNote(selectedNote.id)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="ここに書く..."
                    className="w-full h-96 bg-gray-900/50 border border-gray-800 rounded-lg p-4 outline-none focus:border-violet-500 resize-none"
                  />

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">タグ（カンマ区切り）</label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="税務, 投資, メモ"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                    {selectedNote.content || 'まだ内容がありません'}
                  </div>

                  {selectedNote.tags.length > 0 && (
                    <div className="flex gap-2 mt-6 flex-wrap">
                      {selectedNote.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>ノートを選択するか、新規作成してください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

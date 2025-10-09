'use client'

import { useState, useEffect } from 'react'
import { createNote, updateNote, deleteNote, listNotes, searchNotes } from '@/lib/api/notes'

interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
}

interface NotesPanelProps {
  userId?: string
}

const CATEGORIES = [
  { id: 'finance', label: '資産・投資', icon: '💰' },
  { id: 'tax', label: '税務', icon: '📊' },
  { id: 'business', label: 'ビジネス', icon: '🏢' },
  { id: 'goals', label: '目標・計画', icon: '🎯' },
  { id: 'personal', label: '個人メモ', icon: '📝' }
]

export function NotesPanel({ userId = 'default_user' }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editCategory, setEditCategory] = useState('finance')
  const [editTags, setEditTags] = useState('')

  useEffect(() => {
    loadNotes()
  }, [userId])

  const loadNotes = async () => {
    try {
      const data = await listNotes(userId, selectedCategory === 'all' ? undefined : selectedCategory)
      setNotes(data)
    } catch (error) {
      console.error('Error loading notes:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadNotes()
      return
    }

    try {
      const data = await searchNotes(userId, searchQuery)
      setNotes(data)
    } catch (error) {
      console.error('Error searching notes:', error)
    }
  }

  const handleCreateNote = async () => {
    setSelectedNote(null)
    setIsEditing(true)
    setEditTitle('')
    setEditContent('')
    setEditCategory('finance')
    setEditTags('')
  }

  const handleSaveNote = async () => {
    const tags = editTags.split(',').map(t => t.trim()).filter(Boolean)

    try {
      if (selectedNote) {
        await updateNote(selectedNote.id, userId, editTitle, editContent, tags, editCategory)
      } else {
        await createNote(userId, editTitle, editContent, tags, editCategory)
      }

      setIsEditing(false)
      setSelectedNote(null)
      loadNotes()
    } catch (error) {
      console.error('Error saving note:', error)
      alert('保存に失敗しました')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('このノートを削除しますか？')) return

    try {
      await deleteNote(noteId, userId)
      setSelectedNote(null)
      setIsEditing(false)
      loadNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('削除に失敗しました')
    }
  }

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
    setIsEditing(false)
    setEditTitle(note.title)
    setEditContent(note.content)
    setEditCategory(note.category)
    setEditTags(note.tags.join(', '))
  }

  const handleEditNote = () => {
    setIsEditing(true)
  }

  return (
    <div className="notes-panel">
      <div className="notes-sidebar">
        <div className="notes-header">
          <h3>📝 ノート</h3>
          <button onClick={handleCreateNote} className="new-note-button">
            <i className="fas fa-plus"></i>
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="ノートを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>
            <i className="fas fa-search"></i>
          </button>
        </div>

        <div className="categories">
          <button
            className={selectedCategory === 'all' ? 'active' : ''}
            onClick={() => {
              setSelectedCategory('all')
              loadNotes()
            }}
          >
            📚 すべて ({notes.length})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={selectedCategory === cat.id ? 'active' : ''}
              onClick={() => {
                setSelectedCategory(cat.id)
                loadNotes()
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div className="notes-list">
          {notes.map(note => (
            <div
              key={note.id}
              className={`note-item ${selectedNote?.id === note.id ? 'active' : ''}`}
              onClick={() => handleSelectNote(note)}
            >
              <div className="note-title">{note.title}</div>
              <div className="note-preview">
                {note.content.substring(0, 60)}...
              </div>
              <div className="note-meta">
                {CATEGORIES.find(c => c.id === note.category)?.icon}
                <span>{new Date(note.updated_at).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="notes-editor">
        {!selectedNote && !isEditing && (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>ノートを選択</h3>
            <p>左側からノートを選択するか、新規作成してください。</p>
          </div>
        )}

        {(selectedNote || isEditing) && !isEditing && (
          <div className="note-view">
            <div className="note-view-header">
              <h2>{selectedNote?.title}</h2>
              <div className="note-actions">
                <button onClick={handleEditNote}>
                  <i className="fas fa-edit"></i> 編集
                </button>
                <button onClick={() => handleDeleteNote(selectedNote!.id)} className="danger">
                  <i className="fas fa-trash"></i> 削除
                </button>
              </div>
            </div>
            <div className="note-view-content">
              <pre>{selectedNote?.content}</pre>
            </div>
            <div className="note-view-meta">
              <span>{CATEGORIES.find(c => c.id === selectedNote?.category)?.label}</span>
              {selectedNote?.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {isEditing && (
          <div className="note-edit">
            <div className="note-edit-header">
              <input
                type="text"
                placeholder="タイトル"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="title-input"
              />
              <div className="edit-actions">
                <button onClick={handleSaveNote} className="save-button">
                  <i className="fas fa-save"></i> 保存
                </button>
                <button onClick={() => setIsEditing(false)} className="cancel-button">
                  キャンセル
                </button>
              </div>
            </div>

            <textarea
              placeholder="ノートの内容を入力..."
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="content-textarea"
            />

            <div className="note-edit-footer">
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="タグ（カンマ区切り）"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .notes-panel {
          display: flex;
          height: 100%;
          background: var(--bg-primary);
        }

        .notes-sidebar {
          width: 320px;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
        }

        .notes-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .notes-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .new-note-button {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--accent-primary);
          border: none;
          color: white;
          cursor: pointer;
          transition: all var(--transition);
        }

        .new-note-button:hover {
          background: var(--accent-secondary);
        }

        .search-box {
          padding: 1rem;
          display: flex;
          gap: 0.5rem;
        }

        .search-box input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .search-box button {
          width: 40px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg-primary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition);
        }

        .search-box button:hover {
          background: var(--bg-hover);
        }

        .categories {
          padding: 0 1rem;
          border-bottom: 1px solid var(--border);
        }

        .categories button {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.875rem;
          text-align: left;
          cursor: pointer;
          transition: all var(--transition);
        }

        .categories button:hover {
          background: var(--bg-hover);
        }

        .categories button.active {
          background: var(--accent-primary);
          color: white;
        }

        .notes-list {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .note-item {
          padding: 1rem;
          margin-bottom: 0.75rem;
          border-radius: 8px;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all var(--transition);
        }

        .note-item:hover {
          border-color: var(--accent-primary);
        }

        .note-item.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }

        .note-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .note-preview {
          font-size: 0.8rem;
          opacity: 0.8;
          margin-bottom: 0.5rem;
        }

        .note-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .notes-editor {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .note-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 2rem;
        }

        .note-view-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .note-view-header h2 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .note-actions {
          display: flex;
          gap: 0.5rem;
        }

        .note-actions button {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition);
        }

        .note-actions button:hover {
          background: var(--bg-hover);
        }

        .note-actions button.danger:hover {
          background: var(--accent-danger);
          color: white;
          border-color: var(--accent-danger);
        }

        .note-view-content {
          flex: 1;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 12px;
          overflow-y: auto;
        }

        .note-view-content pre {
          white-space: pre-wrap;
          font-family: inherit;
          color: var(--text-primary);
          line-height: 1.8;
        }

        .note-view-meta {
          margin-top: 1.5rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .note-view-meta span {
          padding: 0.25rem 0.75rem;
          background: var(--bg-secondary);
          border-radius: 12px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .tag {
          background: var(--accent-primary) !important;
          color: white !important;
        }

        .note-edit {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 2rem;
        }

        .note-edit-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .title-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 1.5rem;
          font-weight: 600;
        }

        .edit-actions {
          display: flex;
          gap: 0.5rem;
        }

        .save-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          background: var(--accent-primary);
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all var(--transition);
        }

        .save-button:hover {
          background: var(--accent-secondary);
        }

        .cancel-button {
          padding: 0.75rem 1.5rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition);
        }

        .cancel-button:hover {
          background: var(--bg-hover);
        }

        .content-textarea {
          flex: 1;
          padding: 1.5rem;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 1rem;
          line-height: 1.8;
          resize: none;
        }

        .note-edit-footer {
          margin-top: 1.5rem;
          display: flex;
          gap: 1rem;
        }

        .note-edit-footer select,
        .note-edit-footer input {
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .note-edit-footer select {
          flex: 0 0 200px;
        }

        .note-edit-footer input {
          flex: 1;
        }
      `}</style>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useNotesStore } from '../stores/notesStore'

interface Note {
  id: string
  userId: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

interface NotesPanelProps {
  userId: string
}

export function NotesPanel({ userId }: NotesPanelProps) {
  const { notes, isLoading, loadNotes, createNote, updateNote, deleteNote } = useNotesStore()
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    loadNotes(userId)
  }, [userId, loadNotes])

  const handleCreateNew = () => {
    setSelectedNote(null)
    setIsEditing(true)
    setTitle('')
    setContent('')
    setTags([])
  }

  const handleSave = async () => {
    if (!title.trim()) return

    if (selectedNote) {
      await updateNote(selectedNote.id, userId, title, content, tags)
    } else {
      await createNote(userId, title, content, tags)
    }

    setIsEditing(false)
    setSelectedNote(null)
    loadNotes(userId)
  }

  const handleDelete = async (noteId: string) => {
    if (confirm('このノートを削除しますか？')) {
      await deleteNote(noteId, userId)
      setSelectedNote(null)
      loadNotes(userId)
    }
  }

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
    setIsEditing(false)
    setTitle(note.title)
    setContent(note.content)
    setTags(note.tags)
  }

  return (
    <div className="flex h-full bg-background">
      {/* Notes List */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <button
            onClick={handleCreateNew}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            ➕ 新しいノート
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <p className="text-center text-muted-foreground">読み込み中...</p>
          ) : notes.length === 0 ? (
            <p className="text-center text-muted-foreground">ノートがありません</p>
          ) : (
            notes.map((note) => (
              <button
                key={note.id}
                onClick={() => handleSelectNote(note)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedNote?.id === note.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-accent'
                }`}
              >
                <h3 className="font-semibold truncate">{note.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(note.updatedAt).toLocaleDateString('ja-JP')}
                </p>
                {note.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {note.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-accent rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Note Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote || isEditing ? (
          <>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="タイトル"
                    className="w-full text-2xl font-bold bg-transparent border-none outline-none"
                  />
                ) : (
                  <h1 className="text-2xl font-bold">{title}</h1>
                )}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-secondary rounded-lg hover:bg-accent"
                    >
                      キャンセル
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-secondary rounded-lg hover:bg-accent"
                    >
                      編集
                    </button>
                    {selectedNote && (
                      <button
                        onClick={() => handleDelete(selectedNote.id)}
                        className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90"
                      >
                        削除
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="ノートの内容を入力..."
                  className="w-full h-full resize-none bg-transparent border-none outline-none text-lg"
                />
              ) : (
                <div className="prose prose-lg max-w-none">
                  <p className="whitespace-pre-wrap">{content}</p>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="p-4 border-t border-border">
                <input
                  type="text"
                  value={tags.join(', ')}
                  onChange={(e) =>
                    setTags(
                      e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="タグ（カンマ区切り）"
                  className="w-full px-4 py-2 bg-secondary rounded-lg border border-border"
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-6xl mb-4">📝</p>
              <p className="text-lg">ノートを選択するか、新規作成してください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

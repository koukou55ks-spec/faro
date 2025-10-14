'use client'

import { useState, useEffect } from 'react'
import { useNotesStore } from '../stores/notesStore'
import { useGuestNotesStore } from '../stores/guestNotesStore'
import { NotionEditor } from '../../../../components/editor/NotionEditor'
import { FileText, Plus, Search, Trash2, Edit3, ChevronRight, AlertCircle } from 'lucide-react'

interface Block {
  id: string
  type: 'paragraph' | 'h1' | 'h2' | 'h3' | 'bulletList' | 'numberedList' | 'todo' | 'quote' | 'code'
  content: string
  checked?: boolean
  metadata?: Record<string, unknown>
}

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
  const isGuest = userId === 'guest'

  // 認証ユーザー用
  const { notes: authNotes, isLoading: authLoading, loadNotes, createNote: createAuthNote, updateNote: updateAuthNote, deleteNote: deleteAuthNote } = useNotesStore()

  // ゲストユーザー用
  const { notes: guestNotes, addNote: addGuestNote, updateNote: updateGuestNote, deleteNote: deleteGuestNote } = useGuestNotesStore()

  const notes = isGuest ? guestNotes : authNotes
  const isLoading = isGuest ? false : authLoading

  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [editorBlocks, setEditorBlocks] = useState<Block[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isGuest) {
      loadNotes(userId).catch((err) => {
        console.error('Failed to load notes:', err)
        setError('ノートの読み込みに失敗しました')
      })
    }
  }, [userId, loadNotes, isGuest])

  const handleCreateNew = () => {
    setSelectedNote(null)
    setIsEditing(true)
    setTitle('無題のノート')
    setEditorBlocks([{ id: 'initial', type: 'paragraph', content: '' }])
    setTags([])
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('タイトルを入力してください')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Blocksをプレーンテキストに変換（保存用）
      const content = editorBlocks.map((block) => block.content).join('\n')

      if (isGuest) {
        // ゲストユーザー: ローカルストレージに保存
        if (selectedNote) {
          updateGuestNote(selectedNote.id, { title, content, tags })
        } else {
          addGuestNote({ userId: 'guest', title, content, tags })
        }
        setIsEditing(false)
        setSelectedNote(null)
      } else {
        // 認証ユーザー: APIに保存
        if (selectedNote) {
          await updateAuthNote(selectedNote.id, userId, title, content, tags)
        } else {
          await createAuthNote(userId, title, content, tags)
        }
        setIsEditing(false)
        await loadNotes(userId)
      }
    } catch (err: any) {
      console.error('Failed to save note:', err)
      setError(err?.message || 'ノートの保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm('このノートを削除しますか？')) return

    setError(null)

    try {
      if (isGuest) {
        deleteGuestNote(noteId)
      } else {
        await deleteAuthNote(noteId, userId)
        await loadNotes(userId)
      }
      setSelectedNote(null)
    } catch (err: any) {
      console.error('Failed to delete note:', err)
      setError(err?.message || 'ノートの削除に失敗しました')
    }
  }

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
    setIsEditing(false)
    setTitle(note.title)
    setTags(note.tags)

    // プレーンテキストをBlocksに変換
    const blocks: Block[] = note.content
      .split('\n')
      .filter((line) => line.trim())
      .map((line, idx) => ({
        id: `block-${idx}`,
        type: 'paragraph' as const,
        content: line,
      }))

    setEditorBlocks(blocks.length > 0 ? blocks : [{ id: 'initial', type: 'paragraph', content: '' }])
  }

  const filteredNotes = searchQuery
    ? notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : notes

  return (
    <div className="flex h-full bg-white relative">
      {/* Notion風サイドバー */}
      <div className={`
        ${selectedNote && 'hidden md:flex'}
        w-full md:w-64 border-r border-gray-200 flex flex-col bg-gray-50
      `}>
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleCreateNew}
            className="w-full flex items-center gap-2 px-3 py-2 bg-faro-purple text-white rounded-lg hover:bg-faro-purple-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">新規ノート</span>
          </button>
        </div>

        {/* 検索 */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ノートを検索..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-faro-purple focus:border-transparent"
            />
          </div>
        </div>

        {/* ノート一覧 */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">読み込み中...</div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 text-center">
                {searchQuery ? '該当するノートがありません' : 'ノートを作成して始めましょう'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`w-full text-left p-3 rounded-lg transition-all group ${
                    selectedNote?.id === note.id
                      ? 'bg-faro-purple text-white shadow-sm'
                      : 'hover:bg-white text-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <FileText
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        selectedNote?.id === note.id ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate text-sm">{note.title}</h3>
                      <p
                        className={`text-xs mt-1 truncate ${
                          selectedNote?.id === note.id ? 'text-faro-purple-light' : 'text-gray-500'
                        }`}
                      >
                        {note.content.split('\n')[0] || '空白のノート'}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          selectedNote?.id === note.id ? 'text-faro-purple-light' : 'text-gray-400'
                        }`}
                      >
                        {new Date(note.updatedAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>

                  {note.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {note.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-0.5 rounded ${
                            selectedNote?.id === note.id
                              ? 'bg-faro-purple-dark text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notion風エディター */}
      <div className={`
        ${!selectedNote && !isEditing && 'hidden md:flex'}
        flex-1 flex flex-col bg-white
      `}>
        {selectedNote || isEditing ? (
          <>
            {/* エラー表示 */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 md:mx-12 mt-4 rounded">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* ツールバー */}
            <div className="border-b border-gray-200 px-4 md:px-12 py-3 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {/* モバイル用戻るボタン */}
                <button
                  onClick={() => {
                    setSelectedNote(null)
                    setIsEditing(false)
                  }}
                  className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>

                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-1.5 bg-faro-purple text-white text-sm rounded-lg hover:bg-faro-purple-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? '保存中...' : '保存'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        if (selectedNote) {
                          handleSelectNote(selectedNote)
                        }
                      }}
                      className="px-4 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      キャンセル
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      編集
                    </button>
                    {selectedNote && (
                      <button
                        onClick={() => handleDelete(selectedNote.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        削除
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* タグ入力 */}
              {isEditing && (
                <div className="hidden md:flex items-center gap-2">
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
                    className="px-3 py-1.5 bg-gray-100 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-faro-purple w-64"
                  />
                </div>
              )}
            </div>

            {/* エディター本体 */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 md:px-12 py-6 md:py-8">
                {/* タイトル */}
                <div className="mb-6">
                  {isEditing ? (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="無題"
                      className="w-full text-2xl md:text-4xl font-bold bg-transparent border-none outline-none text-gray-900 placeholder-gray-300"
                    />
                  ) : (
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900">{title}</h1>
                  )}

                  {/* メタデータ */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-3 text-xs md:text-sm text-gray-500">
                    <span>
                      最終更新:{' '}
                      {selectedNote
                        ? new Date(selectedNote.updatedAt).toLocaleString('ja-JP', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '保存されていません'}
                    </span>
                    {tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-faro-purple/10 text-faro-purple text-xs rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* モバイル用タグ入力 */}
                  {isEditing && (
                    <div className="md:hidden mt-4">
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
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-faro-purple"
                      />
                    </div>
                  )}
                </div>

                {/* コンテンツ */}
                <div className="prose prose-lg max-w-none">
                  {isEditing ? (
                    <NotionEditor
                      initialContent={editorBlocks}
                      onChange={setEditorBlocks}
                      autoFocus
                      placeholder="何か入力するか、'/' でコマンドを表示..."
                    />
                  ) : (
                    <div className="space-y-2">
                      {editorBlocks.map((block) => (
                        <div key={block.id} className="text-gray-900">
                          {block.type === 'h1' && (
                            <h1 className="text-3xl font-bold">{block.content}</h1>
                          )}
                          {block.type === 'h2' && (
                            <h2 className="text-2xl font-bold">{block.content}</h2>
                          )}
                          {block.type === 'h3' && (
                            <h3 className="text-xl font-bold">{block.content}</h3>
                          )}
                          {block.type === 'quote' && (
                            <blockquote className="border-l-4 border-faro-purple pl-4 italic text-gray-700">
                              {block.content}
                            </blockquote>
                          )}
                          {block.type === 'code' && (
                            <pre className="bg-gray-100 rounded-lg p-3 overflow-x-auto">
                              <code className="text-sm font-mono">{block.content}</code>
                            </pre>
                          )}
                          {block.type === 'bulletList' && (
                            <ul className="list-disc ml-6">
                              <li>{block.content}</li>
                            </ul>
                          )}
                          {block.type === 'numberedList' && (
                            <ol className="list-decimal ml-6">
                              <li>{block.content}</li>
                            </ol>
                          )}
                          {block.type === 'todo' && (
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={block.checked}
                                readOnly
                                className="w-4 h-4"
                              />
                              <span className={block.checked ? 'line-through text-gray-400' : ''}>
                                {block.content}
                              </span>
                            </div>
                          )}
                          {block.type === 'paragraph' && <p>{block.content}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">ノートを選択</h3>
              <p className="text-gray-500">
                左のサイドバーからノートを選択するか、新規作成してください
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

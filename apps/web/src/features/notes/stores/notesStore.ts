import { create } from 'zustand'

interface Note {
  id: string
  userId: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

interface NotesStore {
  notes: Note[]
  isLoading: boolean
  loadNotes: (userId: string) => Promise<void>
  createNote: (userId: string, title: string, content: string, tags: string[]) => Promise<void>
  updateNote: (noteId: string, userId: string, title: string, content: string, tags: string[]) => Promise<void>
  deleteNote: (noteId: string, userId: string) => Promise<void>
}

export const useNotesStore = create<NotesStore>((set) => ({
  notes: [],
  isLoading: false,

  loadNotes: async (userId: string) => {
    set({ isLoading: true })
    try {
      const response = await fetch(`/api/notes?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to load notes')

      const data = await response.json()
      const notes = (data.notes || []).map((note: any) => ({
        id: note.id,
        userId: note.user_id,
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        createdAt: new Date(note.created_at),
        updatedAt: new Date(note.updated_at),
      }))
      set({ notes })
    } catch (error) {
      console.error('Load notes error:', error)
      set({ notes: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  createNote: async (userId: string, title: string, content: string, tags: string[]) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, content, tags }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create note')
      }
      const data = await response.json()
      console.log('Note created:', data.note)
    } catch (error) {
      console.error('Create note error:', error)
      throw error
    }
  },

  updateNote: async (noteId: string, userId: string, title: string, content: string, tags: string[]) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: noteId, userId, title, content, tags }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update note')
      }
      const data = await response.json()
      console.log('Note updated:', data.note)
    } catch (error) {
      console.error('Update note error:', error)
      throw error
    }
  },

  deleteNote: async (noteId: string, userId: string) => {
    try {
      const response = await fetch(`/api/notes?id=${noteId}&userId=${userId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete note')
      }
    } catch (error) {
      console.error('Delete note error:', error)
      throw error
    }
  },
}))

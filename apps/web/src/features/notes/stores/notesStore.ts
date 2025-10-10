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
      set({ notes: data.data || [] })
    } catch (error) {
      console.error('Load notes error:', error)
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
      if (!response.ok) throw new Error('Failed to create note')
    } catch (error) {
      console.error('Create note error:', error)
      throw error
    }
  },

  updateNote: async (noteId: string, userId: string, title: string, content: string, tags: string[]) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, content, tags }),
      })
      if (!response.ok) throw new Error('Failed to update note')
    } catch (error) {
      console.error('Update note error:', error)
      throw error
    }
  },

  deleteNote: async (noteId: string, userId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}?userId=${userId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete note')
    } catch (error) {
      console.error('Delete note error:', error)
      throw error
    }
  },
}))

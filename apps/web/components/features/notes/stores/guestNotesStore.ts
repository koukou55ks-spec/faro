import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Note {
  id: string
  userId: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

interface GuestNotesStore {
  notes: Note[]
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => void
  deleteNote: (id: string) => void
  getNotes: () => Note[]
}

export const useGuestNotesStore = create<GuestNotesStore>()(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (note) => {
        const newNote: Note = {
          ...note,
          id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          notes: [newNote, ...state.notes],
        }))
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          ),
        }))
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }))
      },

      getNotes: () => get().notes,
    }),
    {
      name: 'faro-guest-notes',
      partialize: (state) => ({ notes: state.notes }),
    }
  )
)

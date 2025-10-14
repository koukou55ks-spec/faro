import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GuestDocument {
  id: string
  title: string
  content: string
  file_type: 'txt' | 'md'
  word_count: number
  uploaded_at: string
  collectionId?: string
}

export interface GuestCollection {
  id: string
  name: string
  description?: string
  icon: string
  parentId?: string | null
  sortOrder: number
  isExpanded: boolean
  createdAt: string
}

interface GuestDocumentsState {
  documents: GuestDocument[]
  collections: GuestCollection[]
  error: string | null

  // Document Actions
  addDocument: (title: string, content: string, collectionId?: string) => void
  deleteDocument: (documentId: string) => void
  updateDocument: (documentId: string, updates: Partial<Pick<GuestDocument, 'title' | 'content' | 'collectionId'>>) => void

  // Collection Actions
  addCollection: (name: string, description?: string, icon?: string, parentId?: string) => GuestCollection
  updateCollection: (collectionId: string, updates: Partial<Pick<GuestCollection, 'name' | 'description' | 'icon' | 'parentId' | 'isExpanded'>>) => void
  deleteCollection: (collectionId: string) => void
  toggleCollectionExpanded: (collectionId: string) => void

  setError: (error: string | null) => void
}

export const useGuestDocumentsStore = create<GuestDocumentsState>()(
  persist(
    (set) => ({
      documents: [],
      collections: [],
      error: null,

      // Document Actions
      addDocument: (title: string, content: string, collectionId?: string) => {
        const newDocument: GuestDocument = {
          id: `guest-doc-${Date.now()}`,
          title,
          content,
          file_type: 'txt',
          word_count: content.split(/\s+/).filter(w => w.length > 0).length,
          uploaded_at: new Date().toISOString(),
          collectionId,
        }

        set((state) => ({
          documents: [newDocument, ...state.documents],
          error: null,
        }))

        console.log('[GuestDocumentsStore] Document added:', newDocument.id)
      },

      deleteDocument: (documentId: string) => {
        set((state) => ({
          documents: state.documents.filter(d => d.id !== documentId),
        }))
        console.log('[GuestDocumentsStore] Document deleted:', documentId)
      },

      updateDocument: (documentId: string, updates: Partial<Pick<GuestDocument, 'title' | 'content' | 'collectionId'>>) => {
        set((state) => ({
          documents: state.documents.map(d =>
            d.id === documentId ? { ...d, ...updates } : d
          ),
        }))
        console.log('[GuestDocumentsStore] Document updated:', documentId)
      },

      // Collection Actions
      addCollection: (name: string, description?: string, icon?: string, parentId?: string) => {
        const newCollection: GuestCollection = {
          id: `guest-collection-${Date.now()}`,
          name,
          description,
          icon: icon || '📁',
          parentId: parentId || null,
          sortOrder: 0,
          isExpanded: true,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          collections: [newCollection, ...state.collections],
          error: null,
        }))

        console.log('[GuestDocumentsStore] Collection added:', newCollection.id)
        return newCollection
      },

      updateCollection: (collectionId: string, updates: Partial<Pick<GuestCollection, 'name' | 'description' | 'icon' | 'parentId' | 'isExpanded'>>) => {
        set((state) => ({
          collections: state.collections.map(c =>
            c.id === collectionId ? { ...c, ...updates } : c
          ),
        }))
        console.log('[GuestDocumentsStore] Collection updated:', collectionId)
      },

      deleteCollection: (collectionId: string) => {
        set((state) => ({
          collections: state.collections.filter(c => c.id !== collectionId),
          // Also remove documents in this collection
          documents: state.documents.map(d =>
            d.collectionId === collectionId ? { ...d, collectionId: undefined } : d
          ),
        }))
        console.log('[GuestDocumentsStore] Collection deleted:', collectionId)
      },

      toggleCollectionExpanded: (collectionId: string) => {
        set((state) => ({
          collections: state.collections.map(c =>
            c.id === collectionId ? { ...c, isExpanded: !c.isExpanded } : c
          ),
        }))
      },

      setError: (error: string | null) => {
        set({ error })
      },
    }),
    {
      name: 'faro-guest-documents-storage',
    }
  )
)

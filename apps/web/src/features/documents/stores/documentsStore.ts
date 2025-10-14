import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Document {
  id: string
  title: string
  file_type: 'pdf' | 'txt' | 'md' | 'csv' | 'docx'
  file_url: string
  file_size: number
  page_count?: number
  word_count?: number
  collection_id?: string
  uploaded_at: string
  metadata?: Record<string, any>
}

export interface Collection {
  id: string
  name: string
  description?: string
  icon: string
  parentId?: string | null
  sortOrder: number
  isExpanded: boolean
  documentCount: number
  createdAt: string
  updatedAt: string
}

interface DocumentsState {
  documents: Document[]
  collections: Collection[]
  selectedDocuments: string[]
  selectedCollections: string[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchDocuments: (token: string, collectionId?: string) => Promise<void>
  fetchCollections: (token: string) => Promise<void>
  uploadDocument: (token: string, file: File, collectionId?: string) => Promise<Document>
  deleteDocument: (documentId: string, token: string) => Promise<void>
  createCollection: (token: string, name: string, description?: string, icon?: string, parentId?: string) => Promise<Collection>
  updateCollection: (collectionId: string, token: string, updates: Partial<Pick<Collection, 'name' | 'description' | 'icon' | 'parentId' | 'isExpanded'>>) => Promise<void>
  deleteCollection: (collectionId: string, token: string) => Promise<void>
  addDocumentToCollection: (documentId: string, collectionId: string, token: string) => Promise<void>
  removeDocumentFromCollection: (documentId: string, collectionId: string, token: string) => Promise<void>
  toggleDocumentSelection: (documentId: string) => void
  toggleCollectionSelection: (collectionId: string) => void
  toggleCollectionExpanded: (collectionId: string) => void
  clearSelection: () => void
  setError: (error: string | null) => void
}

export const useDocumentsStore = create<DocumentsState>()(
  persist(
    (set, get) => ({
      documents: [],
      collections: [],
      selectedDocuments: [],
      selectedCollections: [],
      isLoading: false,
      error: null,

      fetchDocuments: async (token: string, collectionId?: string) => {
        set({ isLoading: true, error: null })
        try {
          const url = collectionId
            ? `/api/documents?collectionId=${collectionId}`
            : '/api/documents'

          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error('Failed to fetch documents')
          }

          const data = await response.json()
          set({ documents: data.documents || [], isLoading: false })
        } catch (error: any) {
          console.error('[DocumentsStore] Fetch documents error:', error)
          set({ error: error.message, isLoading: false })
        }
      },

      fetchCollections: async (token: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/collections', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error('Failed to fetch collections')
          }

          const data = await response.json()
          set({ collections: data.collections || [], isLoading: false })
        } catch (error: any) {
          console.error('[DocumentsStore] Fetch collections error:', error)
          set({ error: error.message, isLoading: false })
        }
      },

      uploadDocument: async (token: string, file: File, collectionId?: string) => {
        set({ isLoading: true, error: null })
        try {
          const formData = new FormData()
          formData.append('file', file)
          if (collectionId) {
            formData.append('collectionId', collectionId)
          }

          const response = await fetch('/api/documents/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Upload failed')
          }

          const data = await response.json()
          const newDocument: Document = data.document

          set(state => ({
            documents: [newDocument, ...state.documents],
            isLoading: false,
          }))

          return newDocument
        } catch (error: any) {
          console.error('[DocumentsStore] Upload error:', error)
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      deleteDocument: async (documentId: string, token: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/documents/${documentId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error('Failed to delete document')
          }

          set(state => ({
            documents: state.documents.filter(d => d.id !== documentId),
            selectedDocuments: state.selectedDocuments.filter(id => id !== documentId),
            isLoading: false,
          }))
        } catch (error: any) {
          console.error('[DocumentsStore] Delete error:', error)
          set({ error: error.message, isLoading: false })
        }
      },

      createCollection: async (token: string, name: string, description?: string, icon?: string, parentId?: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/collections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, description, icon, parentId }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to create collection')
          }

          const data = await response.json()
          const newCollection: Collection = data.collection

          set(state => ({
            collections: [newCollection, ...state.collections],
            isLoading: false,
          }))

          return newCollection
        } catch (error: any) {
          console.error('[DocumentsStore] Create collection error:', error)
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      updateCollection: async (collectionId: string, token: string, updates: Partial<Pick<Collection, 'name' | 'description' | 'icon' | 'parentId' | 'isExpanded'>>) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/collections/${collectionId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to update collection')
          }

          const data = await response.json()
          const updatedCollection: Collection = data.collection

          set(state => ({
            collections: state.collections.map(c =>
              c.id === collectionId ? updatedCollection : c
            ),
            isLoading: false,
          }))
        } catch (error: any) {
          console.error('[DocumentsStore] Update collection error:', error)
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      deleteCollection: async (collectionId: string, token: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/collections/${collectionId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to delete collection')
          }

          set(state => ({
            collections: state.collections.filter(c => c.id !== collectionId),
            selectedCollections: state.selectedCollections.filter(id => id !== collectionId),
            isLoading: false,
          }))
        } catch (error: any) {
          console.error('[DocumentsStore] Delete collection error:', error)
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      addDocumentToCollection: async (documentId: string, collectionId: string, token: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/documents/${documentId}/collections`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ collectionId }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to add document to collection')
          }

          set({ isLoading: false })
        } catch (error: any) {
          console.error('[DocumentsStore] Add document to collection error:', error)
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      removeDocumentFromCollection: async (documentId: string, collectionId: string, token: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/documents/${documentId}/collections?collectionId=${collectionId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to remove document from collection')
          }

          set({ isLoading: false })
        } catch (error: any) {
          console.error('[DocumentsStore] Remove document from collection error:', error)
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      toggleDocumentSelection: (documentId: string) => {
        set(state => ({
          selectedDocuments: state.selectedDocuments.includes(documentId)
            ? state.selectedDocuments.filter(id => id !== documentId)
            : [...state.selectedDocuments, documentId],
        }))
      },

      toggleCollectionSelection: (collectionId: string) => {
        set(state => ({
          selectedCollections: state.selectedCollections.includes(collectionId)
            ? state.selectedCollections.filter(id => id !== collectionId)
            : [...state.selectedCollections, collectionId],
        }))
      },

      toggleCollectionExpanded: (collectionId: string) => {
        set(state => ({
          collections: state.collections.map(c =>
            c.id === collectionId ? { ...c, isExpanded: !c.isExpanded } : c
          ),
        }))
      },

      clearSelection: () => {
        set({ selectedDocuments: [], selectedCollections: [] })
      },

      setError: (error: string | null) => {
        set({ error })
      },
    }),
    {
      name: 'faro-documents-storage',
      partialize: (state) => ({
        selectedDocuments: state.selectedDocuments,
        selectedCollections: state.selectedCollections,
      }),
    }
  )
)

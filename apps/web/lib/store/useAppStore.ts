import { create } from 'zustand'

export type ViewMode = 'chat' | 'notes' | 'kakeibo' | 'documents' | 'notebook' | 'report'

interface AppState {
  viewMode: ViewMode
  isSidebarOpen: boolean
  setViewMode: (mode: ViewMode) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  viewMode: 'chat',
  isSidebarOpen: false, // Default closed on mobile, will be opened programmatically on desktop
  setViewMode: (mode) => set({ viewMode: mode }),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))

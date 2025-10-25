import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings, UserSettingsUpdate } from '../../types/settings'

interface SettingsState {
  settings: UserSettings | null
  loading: boolean
  error: string | null

  // アクション
  fetchSettings: () => Promise<void>
  updateSettings: (updates: UserSettingsUpdate) => Promise<void>
  updateSetting: (key: keyof UserSettingsUpdate, value: any) => Promise<void>
  resetSettings: () => Promise<void>
  setSettings: (settings: UserSettings) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: null,
      loading: false,
      error: null,

      fetchSettings: async () => {
        set({ loading: true, error: null })
        try {
          const response = await fetch('/api/v1/settings')

          if (!response.ok) {
            throw new Error('Failed to fetch settings')
          }

          const data = await response.json()
          set({ settings: data.settings, loading: false })
        } catch (error) {
          console.error('[SettingsStore] Failed to fetch settings:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch settings',
            loading: false,
          })
        }
      },

      updateSettings: async (updates: UserSettingsUpdate) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch('/api/v1/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          })

          if (!response.ok) {
            throw new Error('Failed to update settings')
          }

          const data = await response.json()
          set({ settings: data.settings, loading: false })
        } catch (error) {
          console.error('[SettingsStore] Failed to update settings:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to update settings',
            loading: false,
          })
        }
      },

      updateSetting: async (key: keyof UserSettingsUpdate, value: any) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch('/api/v1/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value }),
          })

          if (!response.ok) {
            throw new Error('Failed to update setting')
          }

          const data = await response.json()
          set({ settings: data.settings, loading: false })
        } catch (error) {
          console.error('[SettingsStore] Failed to update setting:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to update setting',
            loading: false,
          })
        }
      },

      resetSettings: async () => {
        set({ loading: true, error: null })
        try {
          const response = await fetch('/api/v1/settings', {
            method: 'DELETE',
          })

          if (!response.ok) {
            throw new Error('Failed to reset settings')
          }

          const data = await response.json()
          set({ settings: data.settings, loading: false })
        } catch (error) {
          console.error('[SettingsStore] Failed to reset settings:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to reset settings',
            loading: false,
          })
        }
      },

      setSettings: (settings: UserSettings) => {
        set({ settings })
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
)

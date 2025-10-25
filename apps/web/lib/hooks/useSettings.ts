import { useEffect } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'

export function useSettings() {
  const {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    updateSetting,
    resetSettings,
  } = useSettingsStore()

  // 初回マウント時に設定を取得
  useEffect(() => {
    if (!settings && !loading) {
      fetchSettings()
    }
  }, [settings, loading, fetchSettings])

  return {
    settings,
    loading,
    error,
    updateSettings,
    updateSetting,
    resetSettings,
    refetch: fetchSettings,
  }
}

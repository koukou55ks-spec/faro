'use client'

import { useState, useEffect } from 'react'

const ICON_OPTIONS = [
  '📁', '📂', '📚', '📖', '📝', '📄', '📃', '📑',
  '💼', '🗂️', '📊', '📈', '📉', '💰', '💵', '💳',
  '🏠', '🏢', '🏦', '🏪', '🏭', '🚗', '✈️', '🎓',
  '💡', '⭐', '🎯', '🔥', '💎', '🎨', '🔬', '⚙️'
]

interface IconPickerProps {
  currentIcon: string
  onSelect: (icon: string) => void
  onClose: () => void
}

export function IconPicker({ currentIcon, onSelect, onClose }: IconPickerProps) {
  const [selectedIcon, setSelectedIcon] = useState(currentIcon)

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSelect = (icon: string) => {
    setSelectedIcon(icon)
    onSelect(icon)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-4 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          アイコンを選択
        </h3>
        <div className="grid grid-cols-8 gap-2">
          {ICON_OPTIONS.map((icon) => (
            <button
              key={icon}
              onClick={() => handleSelect(icon)}
              className={`text-2xl p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                selectedIcon === icon ? 'bg-faro-purple/10 ring-2 ring-faro-purple' : ''
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { Check } from 'lucide-react'

interface CategoryFilterProps {
  categories: string[]
  selectedCategories: string[]
  onChange: (categories: string[]) => void
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  '収入': {
    bg: 'bg-green-100 hover:bg-green-200',
    border: 'border-green-300',
    text: 'text-green-800'
  },
  '控除': {
    bg: 'bg-blue-100 hover:bg-blue-200',
    border: 'border-blue-300',
    text: 'text-blue-800'
  },
  '医療費': {
    bg: 'bg-red-100 hover:bg-red-200',
    border: 'border-red-300',
    text: 'text-red-800'
  },
  '保険': {
    bg: 'bg-purple-100 hover:bg-purple-200',
    border: 'border-purple-300',
    text: 'text-purple-800'
  },
  '資産': {
    bg: 'bg-yellow-100 hover:bg-yellow-200',
    border: 'border-yellow-300',
    text: 'text-yellow-800'
  },
  '負債': {
    bg: 'bg-orange-100 hover:bg-orange-200',
    border: 'border-orange-300',
    text: 'text-orange-800'
  },
  'その他': {
    bg: 'bg-gray-100 hover:bg-gray-200',
    border: 'border-gray-300',
    text: 'text-gray-800'
  }
}

const DEFAULT_COLOR = {
  bg: 'bg-gray-100 hover:bg-gray-200',
  border: 'border-gray-300',
  text: 'text-gray-800'
}

export default function CategoryFilter({ categories, selectedCategories, onChange }: CategoryFilterProps) {
  const handleToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter(c => c !== category))
    } else {
      onChange([...selectedCategories, category])
    }
  }

  const handleSelectAll = () => {
    onChange(categories)
  }

  const handleClearAll = () => {
    onChange([])
  }

  const isAllSelected = selectedCategories.length === categories.length
  const isNoneSelected = selectedCategories.length === 0

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || DEFAULT_COLOR
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">カテゴリフィルター</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            disabled={isAllSelected}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-medium transition-colors"
          >
            すべて選択
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleClearAll}
            disabled={isNoneSelected}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-medium transition-colors"
          >
            クリア
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category)
          const colors = getCategoryColor(category)

          return (
            <button
              key={category}
              onClick={() => handleToggle(category)}
              className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                border-2 transition-all duration-200
                ${isSelected
                  ? `${colors.bg} ${colors.border} ${colors.text}`
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }
              `}
            >
              {isSelected && (
                <Check className="w-3 h-3" />
              )}
              <span>{category}</span>
            </button>
          )
        })}
      </div>

      {selectedCategories.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {selectedCategories.length}個のカテゴリを選択中
          </p>
        </div>
      )}
    </div>
  )
}

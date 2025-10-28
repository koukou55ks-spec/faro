'use client'

import { useState } from 'react'
import { Pencil, Save, X } from 'lucide-react'
import { useUserProfile } from '../../../lib/hooks/useUserProfile'
import { EmploymentType } from '../../../lib/types/userProfile'

const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: '会社員（正社員）',
  part_time: 'パート・アルバイト',
  freelance: 'フリーランス',
  self_employed: '個人事業主',
  student: '学生',
  retired: '退職',
  unemployed: '無職'
}

interface ProfileField {
  key: 'annual_income' | 'age' | 'prefecture' | 'num_dependents' | 'employment_type'
  label: string
  type: 'number' | 'text' | 'select'
  unit?: string
  options?: EmploymentType[]
}

const PROFILE_FIELDS: ProfileField[] = [
  { key: 'annual_income', label: '年収', type: 'number', unit: '万円' },
  { key: 'age', label: '年齢', type: 'number', unit: '歳' },
  { key: 'prefecture', label: '都道府県', type: 'text' },
  { key: 'num_dependents', label: '扶養家族', type: 'number', unit: '人' },
  { key: 'employment_type', label: '雇用形態', type: 'select', options: Object.keys(EMPLOYMENT_TYPE_LABELS) as EmploymentType[] }
]

export default function BasicProfileSection() {
  const { profile, loading, error, updateProfile } = useUserProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState({
    annual_income: undefined as number | undefined,
    age: undefined as number | undefined,
    prefecture: undefined as string | undefined,
    num_dependents: undefined as number | undefined,
    employment_type: undefined as EmploymentType | undefined
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleEdit = () => {
    // 年収を万円単位に変換
    const annualIncomeInManYen = profile?.annual_income ? Math.round(profile.annual_income / 10000) : undefined

    setEditValues({
      annual_income: annualIncomeInManYen,
      age: profile?.age,
      prefecture: profile?.prefecture,
      num_dependents: profile?.num_dependents,
      employment_type: profile?.employment_type
    })
    setIsEditing(true)
    setSaveError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValues({
      annual_income: undefined,
      age: undefined,
      prefecture: undefined,
      num_dependents: undefined,
      employment_type: undefined
    })
    setSaveError(null)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveError(null)

      // 年収を円単位に変換
      const annualIncomeInYen = editValues.annual_income ? editValues.annual_income * 10000 : undefined

      await updateProfile({
        annual_income: annualIncomeInYen,
        age: editValues.age,
        prefecture: editValues.prefecture,
        num_dependents: editValues.num_dependents,
        employment_type: editValues.employment_type
      })

      setIsEditing(false)
    } catch (err) {
      console.error('[BasicProfileSection] Error saving profile:', err)
      setSaveError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFieldChange = (key: string, value: string | number | EmploymentType | undefined) => {
    setEditValues(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const formatValue = (field: ProfileField): string => {
    let value: string | number | EmploymentType | undefined

    if (field.key === 'annual_income') {
      // 年収を万円単位に変換
      value = profile?.annual_income ? Math.round(profile.annual_income / 10000) : undefined
    } else {
      value = profile?.[field.key]
    }

    if (value === undefined || value === null || value === '') return '未設定'

    if (field.type === 'select' && field.key === 'employment_type') {
      return EMPLOYMENT_TYPE_LABELS[value as EmploymentType] || String(value)
    }

    if (field.type === 'number' && field.unit) {
      return `${value}${field.unit}`
    }

    return String(value)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-red-600">
          <p className="font-semibold">エラーが発生しました</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">基本プロファイル</h2>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
            編集
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        )}
      </div>

      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{saveError}</p>
        </div>
      )}

      <div className="space-y-4">
        {PROFILE_FIELDS.map((field) => (
          <div key={field.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <span className="text-sm font-medium text-gray-700 w-32">{field.label}</span>

            {isEditing ? (
              <div className="flex-1 max-w-md">
                {field.type === 'select' && field.options ? (
                  <select
                    value={editValues[field.key] ?? ''}
                    onChange={(e) => handleFieldChange(field.key, (e.target.value || undefined) as EmploymentType | undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {EMPLOYMENT_TYPE_LABELS[option]}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'number' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editValues[field.key] ?? ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value ? Number(e.target.value) : undefined)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={field.label}
                    />
                    {field.unit && (
                      <span className="text-sm text-gray-500">{field.unit}</span>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={editValues[field.key] ?? ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={field.label}
                  />
                )}
              </div>
            ) : (
              <span className="text-sm text-gray-900">
                {formatValue(field)}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          これらの基本情報は、AIがあなたに最適な税務アドバイスを提供するために使用されます。
        </p>
      </div>
    </div>
  )
}

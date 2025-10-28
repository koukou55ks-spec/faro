'use client'

import { useState } from 'react'
import { useCustomTabs } from '../../../lib/hooks/useCustomTabs'
import { useUserProfile } from '../../../lib/hooks/useUserProfile'
import { useAuth } from '../../../lib/hooks/useAuth'
import {
  Plus, FileText, Link as LinkIcon, Image as ImageIcon, Upload,
  Trash2, Loader2, X, User, Users, DollarSign, Database, Edit2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CustomTabItem } from '../../../types/custom-tabs'
import { ProfileEditModal } from './ProfileEditModal'

// システムタブ定義
const SYSTEM_TABS = [
  { id: 'basic_info', name: '基本情報', icon: User, color: 'blue' },
  { id: 'family', name: '家族構成', icon: Users, color: 'purple' },
  { id: 'income', name: '収入情報', icon: DollarSign, color: 'green' },
]

// 各タブの固定フィールド定義
const FIXED_FIELDS: Record<string, {key: string, label: string}[]> = {
  basic_info: [
    { key: 'age', label: '年齢' },
    { key: 'occupation', label: '職業' },
    { key: 'prefecture', label: '都道府県' },
  ],
  family: [
    { key: 'marital_status', label: '婚姻状況' },
    { key: 'num_children', label: '子供の人数' },
  ],
  income: [
    { key: 'annual_income', label: '年収' },
    { key: 'residence_type', label: '住居' },
  ],
}

interface SystemTabsSectionProps {
  onDataChange?: () => void
}

export function SystemTabsSection({ onDataChange }: SystemTabsSectionProps) {
  const { token } = useAuth()
  const { profile, updateProfile } = useUserProfile()
  const { fetchTabItems, addTabItem } = useCustomTabs()
  const [selectedTabId, setSelectedTabId] = useState<string>('basic_info')
  const [tabItems, setTabItems] = useState<CustomTabItem[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    type: 'text' as 'text' | 'link' | 'file' | 'image',
    title: '',
    content: '',
    url: '',
    file: null as File | null
  })

  const selectedTab = SYSTEM_TABS.find(t => t.id === selectedTabId)
  const fixedFields = FIXED_FIELDS[selectedTabId] || []

  // タブ選択
  const handleSelectTab = async (tabId: string) => {
    setSelectedTabId(tabId)
    setIsLoadingItems(true)
    try {
      const items = await fetchTabItems(tabId)
      setTabItems(items)
    } catch (err) {
      console.error('Failed to fetch tab items:', err)
      setTabItems([])
    } finally {
      setIsLoadingItems(false)
    }
  }

  // アイテム追加
  const handleAddItem = async () => {
    if (!selectedTabId) return
    if (newItem.type === 'text' && !newItem.content) return
    if (newItem.type === 'link' && (!newItem.title || !newItem.url)) return
    if ((newItem.type === 'file' || newItem.type === 'image') && !newItem.file) return

    try {
      const itemData: any = {
        item_type: newItem.type,
        title: newItem.title,
        display_order: tabItems.length
      }

      if (newItem.type === 'text') {
        itemData.content = newItem.content
      } else if (newItem.type === 'link') {
        itemData.content = newItem.url
      } else if (newItem.type === 'file' || newItem.type === 'image') {
        itemData.content = `[${newItem.type === 'file' ? 'File' : 'Image'}: ${newItem.file!.name}]`
        itemData.file_url = URL.createObjectURL(newItem.file!)
      }

      await addTabItem(selectedTabId, itemData)
      await handleSelectTab(selectedTabId)
      setNewItem({ type: 'text', title: '', content: '', url: '', file: null })
      setIsAddingItem(false)
      if (onDataChange) onDataChange()
    } catch (err) {
      console.error('Failed to add item:', err)
      alert('アイテムの追加に失敗しました')
    }
  }

  // アイテム削除
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('このアイテムを削除しますか？')) return
    if (!token) return

    try {
      const response = await fetch(`/api/custom-tabs/${selectedTabId}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete item')

      await handleSelectTab(selectedTabId)
      if (onDataChange) onDataChange()
    } catch (err) {
      console.error('Failed to delete item:', err)
      alert('アイテムの削除に失敗しました')
    }
  }

  // プロフィール保存
  const handleProfileSave = async (updates: any) => {
    try {
      await updateProfile(updates)
      if (onDataChange) onDataChange()
    } catch (err) {
      console.error('Failed to save profile:', err)
      throw err
    }
  }

  // 固定フィールドの値を取得
  const getFieldDisplay = (key: string): string => {
    if (!profile) return '未設定'
    const value = (profile as any)[key]
    if (!value) return '未設定'

    // マッピング
    const mappings: Record<string, Record<string, string>> = {
      employment_type: { full_time: '正社員', part_time: 'パート・アルバイト', freelance: 'フリーランス', self_employed: '自営業', student: '学生', retired: '退職' },
      marital_status: { single: '独身', married: '既婚', divorced: '離婚', widowed: '死別' },
      residence_type: { owned: '持ち家', rented: '賃貸', family_owned: '家族所有', company_housing: '社宅' }
    }

    if (mappings[key]?.[value]) return mappings[key][value]
    if ((key === 'annual_income' || key === 'household_income') && typeof value === 'number') {
      return `${Math.round(value / 10000)}万円`
    }
    if (key === 'age' && typeof value === 'number') return `${value}歳`
    if (key === 'num_children' || key === 'num_dependents') return `${value}人`

    return String(value)
  }

  return (
    <div className="space-y-4">
      {/* タブ選択 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {SYSTEM_TABS.map((tab) => {
          const Icon = tab.icon
          const isSelected = selectedTabId === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-2 border-blue-500'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.name}</span>
              <Database className="w-3 h-3 opacity-50" />
            </button>
          )
        })}
      </div>

      {/* タブコンテンツ */}
      {selectedTab && (
        <div className="space-y-4">
          {/* 固定フィールド（必須情報） */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-500" />
                必須情報
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              {fixedFields.map(field => (
                <div key={field.key} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{field.label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {getFieldDisplay(field.key)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 追加アイテム */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                追加情報
              </h3>
              <button
                onClick={() => setIsAddingItem(!isAddingItem)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isAddingItem ? (
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>

            {/* アイテム追加フォーム */}
            <AnimatePresence>
              {isAddingItem && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 space-y-3">
                    {/* タイプ選択 */}
                    <div className="flex gap-2 flex-wrap">
                      {(['text', 'link', 'file', 'image'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setNewItem({ ...newItem, type, file: null })}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                            newItem.type === type
                              ? 'bg-blue-500 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {type === 'text' && <FileText className="w-3 h-3 inline mr-1" />}
                          {type === 'link' && <LinkIcon className="w-3 h-3 inline mr-1" />}
                          {type === 'file' && <Upload className="w-3 h-3 inline mr-1" />}
                          {type === 'image' && <ImageIcon className="w-3 h-3 inline mr-1" />}
                          {type === 'text' ? 'テキスト' : type === 'link' ? 'リンク' : type === 'file' ? 'ファイル' : '画像'}
                        </button>
                      ))}
                    </div>

                    {/* 入力フィールド */}
                    {newItem.type === 'text' && (
                      <div>
                        <input
                          type="text"
                          placeholder="タイトル（任意）"
                          value={newItem.title}
                          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                          className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                        <textarea
                          placeholder="内容を入力..."
                          value={newItem.content}
                          onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                    )}

                    {newItem.type === 'link' && (
                      <div>
                        <input
                          type="text"
                          placeholder="タイトル"
                          value={newItem.title}
                          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                          className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                        <input
                          type="url"
                          placeholder="URL"
                          value={newItem.url}
                          onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                    )}

                    {(newItem.type === 'file' || newItem.type === 'image') && (
                      <div>
                        <input
                          type="text"
                          placeholder="タイトル（任意）"
                          value={newItem.title}
                          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                          className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3">
                          <input
                            type="file"
                            accept={newItem.type === 'image' ? 'image/*' : '*'}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) setNewItem({ ...newItem, file })
                            }}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {newItem.file && (
                            <p className="text-xs text-green-600 mt-2">選択: {newItem.file.name}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleAddItem}
                      disabled={
                        (newItem.type === 'text' && !newItem.content) ||
                        (newItem.type === 'link' && (!newItem.title || !newItem.url)) ||
                        ((newItem.type === 'file' || newItem.type === 'image') && !newItem.file)
                      }
                      className="w-full py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      追加
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* アイテム一覧 */}
            {isLoadingItems ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : tabItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                追加アイテムがありません
                <br />
                <span className="text-xs">「+」ボタンから追加してください</span>
              </div>
            ) : (
              <div className="space-y-2">
                {tabItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 relative group"
                  >
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="absolute top-2 right-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </button>
                    {item.title && (
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {item.title}
                      </h4>
                    )}
                    {item.item_type === 'text' && item.content && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {item.content}
                      </p>
                    )}
                    {item.item_type === 'link' && item.content && (
                      <a
                        href={item.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <LinkIcon className="w-3 h-3" />
                        {item.content}
                      </a>
                    )}
                    {(item.item_type === 'file' || item.item_type === 'image') && item.content && (
                      <div className="flex items-center gap-2">
                        {item.item_type === 'file' ? (
                          <Upload className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.content}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* プロフィール編集モーダル */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleProfileSave}
      />
    </div>
  )
}

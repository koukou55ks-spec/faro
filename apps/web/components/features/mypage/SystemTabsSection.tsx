'use client'

import { useState } from 'react'
import { useCustomTabs } from '../../../lib/hooks/useCustomTabs'
import { useAuth } from '../../../lib/hooks/useAuth'
import {
  Plus, FileText, Link as LinkIcon, Image as ImageIcon,
  Trash2, Loader2, X, User, Users, DollarSign, Database
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CustomTab, CustomTabItem } from '../../../types/custom-tabs'

// 固定のシステムタブ定義
const SYSTEM_TABS = [
  { id: 'basic_info', name: '基本情報', icon: User, color: 'blue' },
  { id: 'family', name: '家族構成', icon: Users, color: 'purple' },
  { id: 'income', name: '収入情報', icon: DollarSign, color: 'green' },
]

interface SystemTabsectionProps {
  onDataChange?: () => void
}

export function SystemTabsSection({ onDataChange }: SystemTabsectionProps) {
  const { token } = useAuth()
  const { fetchTabItems, addTabItem } = useCustomTabs()
  const [selectedTabId, setSelectedTabId] = useState<string>('basic_info')
  const [tabItems, setTabItems] = useState<CustomTabItem[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItem, setNewItem] = useState({
    type: 'text' as 'text' | 'link' | 'file' | 'image',
    title: '',
    content: '',
    url: ''
  })

  const selectedTab = SYSTEM_TABS.find(t => t.id === selectedTabId)

  // タブのアイテムを取得
  const handleSelectTab = async (tabId: string) => {
    setSelectedTabId(tabId)
    setIsLoadingItems(true)

    try {
      // システムタブIDをカスタムタブとして扱う（API側で対応必要）
      const items = await fetchTabItems(tabId)
      setTabItems(items)
    } catch (err) {
      console.error('Failed to fetch system tab items:', err)
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
      }

      await addTabItem(selectedTabId, itemData)

      // リフレッシュ
      await handleSelectTab(selectedTabId)

      // リセット
      setNewItem({ type: 'text', title: '', content: '', url: '' })
      setIsAddingItem(false)

      if (onDataChange) onDataChange()
    } catch (err) {
      console.error('Failed to add item:', err)
      alert('アイテムの追加に失敗しました')
    }
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
                  ? `bg-${tab.color}-100 dark:bg-${tab.color}-900/30 text-${tab.color}-700 dark:text-${tab.color}-400 border-2 border-${tab.color}-500`
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {selectedTab.name}のアイテム
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
                  {/* アイテムタイプ選択 */}
                  <div className="flex gap-2">
                    {(['text', 'link'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewItem({ ...newItem, type })}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                          newItem.type === type
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {type === 'text' && <FileText className="w-3 h-3 inline mr-1" />}
                        {type === 'link' && <LinkIcon className="w-3 h-3 inline mr-1" />}
                        {type === 'text' ? 'テキスト' : 'リンク'}
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

                  <button
                    onClick={handleAddItem}
                    disabled={
                      (newItem.type === 'text' && !newItem.content) ||
                      (newItem.type === 'link' && (!newItem.title || !newItem.url))
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
              アイテムがありません
              <br />
              <span className="text-xs">「+」ボタンから追加してください</span>
            </div>
          ) : (
            <div className="space-y-2">
              {tabItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

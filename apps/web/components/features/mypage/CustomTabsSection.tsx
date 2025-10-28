'use client'

import { useState } from 'react'
import { useCustomTabs } from '../../../lib/hooks/useCustomTabs'
import { useAuth } from '../../../lib/hooks/useAuth'
import {
  Plus, Folder, FileText, Link as LinkIcon, Image as ImageIcon,
  Trash2, ChevronRight, Loader2, X, TrendingUp, DollarSign,
  Home, Heart, Users, Briefcase, GraduationCap, Shield,
  Calendar, MapPin, Lightbulb, Star, BookOpen
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CustomTab, CustomTabItem } from '../../../types/custom-tabs'
import TemplateSelectionModal from '../custom-tabs/TemplateSelectionModal'
import TemplateFieldForm, { TemplateField } from '../custom-tabs/TemplateFieldForm'

export function CustomTabsSection() {
  const { token } = useAuth()
  const { tabs, loading, createTab, deleteTab, fetchTabItems, addTabItem } = useCustomTabs()
  const [selectedTab, setSelectedTab] = useState<CustomTab | null>(null)
  const [tabItems, setTabItems] = useState<CustomTabItem[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [newTabName, setNewTabName] = useState('')
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([])
  const [newItem, setNewItem] = useState({
    type: 'text' as 'text' | 'link' | 'file' | 'image',
    title: '',
    content: '',
    url: ''
  })

  const handleSelectTab = async (tab: CustomTab) => {
    setSelectedTab(tab)
    setIsLoadingItems(true)

    try {
      const items = await fetchTabItems(tab.id)
      setTabItems(items)

      // テンプレートフィールドを取得
      if (tab.template_id && token) {
        const response = await fetch(`/api/custom-tab-templates/${tab.template_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setTemplateFields(data.template?.fields || [])
        }
      } else {
        setTemplateFields([]) // テンプレートなし = 自由形式
      }
    } catch (err) {
      console.error('Failed to fetch tab items:', err)
    } finally {
      setIsLoadingItems(false)
    }
  }

  const handleTemplateSelect = (template: { id: string; name: string }) => {
    setSelectedTemplateId(template.id)
    setNewTabName(template.name)
    setShowTemplateModal(false)
  }

  const handleCreateTab = async () => {
    if (!newTabName.trim() || !selectedTemplateId) return

    try {
      const newTab = await createTab({
        name: newTabName,
        icon: 'Folder',
        color: 'blue',
        template_id: selectedTemplateId
      })
      setNewTabName('')
      setSelectedTemplateId(null)
      setShowTemplateModal(false)
      handleSelectTab(newTab)
    } catch (err) {
      console.error('Failed to create tab:', err)
      alert('タブの作成に失敗しました')
    }
  }

  const handleDeleteTab = async (tabId: string) => {
    if (!confirm('このタブを削除しますか？')) return

    try {
      await deleteTab(tabId)
      if (selectedTab?.id === tabId) {
        setSelectedTab(null)
        setTabItems([])
      }
    } catch (err) {
      console.error('Failed to delete tab:', err)
      alert('タブの削除に失敗しました')
    }
  }

  const handleTemplateSubmit = async (formData: Record<string, any>) => {
    if (!selectedTab) return

    try {
      // テンプレートフィールドから自動的にタイトルと内容を生成
      const titleField = templateFields.find(f => f.required) || templateFields[0]
      const title = formData[titleField?.key] || 'アイテム'

      // 全フィールドを自然言語の文章に変換（Vector RAG最適化）
      const contentParts: string[] = []
      templateFields.forEach(field => {
        const value = formData[field.key]
        if (value !== undefined && value !== null && value !== '') {
          const unitText = field.unit ? field.unit : ''
          contentParts.push(`${field.label}: ${value}${unitText}`)
        }
      })
      const naturalLanguageContent = contentParts.join('、')

      const itemData = {
        tab_id: selectedTab.id,
        item_type: 'text' as const,
        title: String(title),
        content: naturalLanguageContent, // 自然言語で保存
        metadata: {
          template_fields: formData // フィールドデータもメタデータに保存（将来の編集用）
        }
      }

      const addedItem = await addTabItem(selectedTab.id, itemData)
      setTabItems([...tabItems, addedItem])
      setIsAddingItem(false)
    } catch (err) {
      console.error('Failed to add template item:', err)
      alert('アイテムの追加に失敗しました')
    }
  }

  const handleAddItem = async () => {
    if (!selectedTab || !newItem.title.trim()) return

    try {
      const itemData: any = {
        item_type: newItem.type,
        title: newItem.title
      }

      if (newItem.type === 'text') {
        itemData.content = newItem.content
      } else if (newItem.type === 'link') {
        itemData.url = newItem.url
      }

      const addedItem = await addTabItem(selectedTab.id, itemData)
      setTabItems([...tabItems, addedItem])
      setNewItem({ type: 'text', title: '', content: '', url: '' })
      setIsAddingItem(false)
    } catch (err) {
      console.error('Failed to add item:', err)
      alert('アイテムの追加に失敗しました')
    }
  }

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500'
      case 'purple': return 'bg-purple-500'
      case 'green': return 'bg-green-500'
      case 'red': return 'bg-red-500'
      case 'yellow': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'file': return FileText
      case 'link': return LinkIcon
      case 'image': return ImageIcon
      case 'text': return FileText
      default: return FileText
    }
  }

  const getTabIcon = (iconName?: string) => {
    const iconMap: Record<string, any> = {
      Folder, FileText, TrendingUp, DollarSign, Home, Heart,
      Users, Briefcase, GraduationCap, Shield, Calendar,
      MapPin, Lightbulb, Star, BookOpen
    }
    return iconMap[iconName || 'Folder'] || Folder
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-purple-500" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              カスタムタブ
            </h2>
          </div>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          NotebookLM風に情報を整理できます
        </p>
      </div>

      <div className="flex" style={{ minHeight: '400px' }}>
        {/* タブリスト */}
        <div className="w-64 border-r border-gray-100 dark:border-gray-700 overflow-y-auto">
          <div className="p-3 space-y-1">
            {tabs.map(tab => {
              const TabIcon = getTabIcon(tab.icon)
              return (
                <div
                  key={tab.id}
                  className={`group relative rounded-lg transition-all ${
                    selectedTab?.id === tab.id
                      ? 'bg-purple-50 dark:bg-purple-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <button
                    onClick={() => handleSelectTab(tab)}
                    className="w-full text-left py-2.5 px-3 flex items-center gap-3"
                  >
                    <div className={`w-8 h-8 rounded-lg ${getColorClass(tab.color)} flex items-center justify-center flex-shrink-0`}>
                      <TabIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
                      {tab.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>
                  <button
                    onClick={() => handleDeleteTab(tab.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              )
            })}

            {tabs.length === 0 && !selectedTemplateId && (
              <div className="text-center py-8 text-sm text-gray-500">
                タブがありません
                <br />
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="text-purple-500 hover:underline mt-2"
                >
                  最初のタブを作成
                </button>
              </div>
            )}
          </div>
        </div>

        {/* タブコンテンツ */}
        <div className="flex-1 overflow-y-auto">
          {selectedTemplateId && newTabName ? (
            <div className="p-6">
              <div className="max-w-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  新しいタブを作成
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  テンプレート: {newTabName}
                </p>
                <input
                  type="text"
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  placeholder="タブ名（例: 2024年投資管理）"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTab()}
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleCreateTab}
                    disabled={!newTabName.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    作成
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplateId(null)
                      setNewTabName('')
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          ) : selectedTab ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedTab.name}
                  </h3>
                  {selectedTab.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {selectedTab.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsAddingItem(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  アイテムを追加
                </button>
              </div>

              {isLoadingItems ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                </div>
              ) : tabItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {tabItems.map(item => {
                    const ItemIcon = getItemTypeIcon(item.item_type)
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                            <ItemIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                              {item.title}
                            </h4>
                            {item.content && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {item.content}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {item.file_type && (
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                  {item.file_type.toUpperCase()}
                                </span>
                              )}
                              <span className="text-xs text-gray-400">
                                {new Date(item.created_at).toLocaleDateString('ja-JP', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">このタブにはまだアイテムがありません</p>
                  <button
                    onClick={() => setIsAddingItem(true)}
                    className="text-purple-500 hover:underline text-sm mt-2"
                  >
                    アイテムを追加する
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Folder className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>タブを選択してください</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* アイテム追加モーダル */}
      <AnimatePresence>
        {isAddingItem && selectedTab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddingItem(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  アイテムを追加
                </h3>
                <button
                  onClick={() => setIsAddingItem(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* テンプレートフィールドがあればテンプレートフォーム、なければ従来のフォーム */}
              {templateFields.length > 0 ? (
                <TemplateFieldForm
                  fields={templateFields}
                  onSubmit={handleTemplateSubmit}
                  onCancel={() => setIsAddingItem(false)}
                />
              ) : (
              <>
              <div className="space-y-4">
                {/* タイプ選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    アイテムタイプ
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { type: 'text', label: 'テキスト', icon: FileText },
                      { type: 'link', label: 'リンク', icon: LinkIcon },
                      { type: 'file', label: 'ファイル', icon: FileText },
                      { type: 'image', label: '画像', icon: ImageIcon },
                    ].map(({ type, label, icon: Icon }) => (
                      <button
                        key={type}
                        onClick={() => setNewItem({ ...newItem, type: type as any })}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                          newItem.type === type
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${newItem.type === type ? 'text-purple-500' : 'text-gray-400'}`} />
                        <span className={`text-xs font-medium ${newItem.type === type ? 'text-purple-700 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* タイトル */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    タイトル
                  </label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="例: 2024年医療費領収書"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* タイプ別フィールド */}
                {newItem.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      内容
                    </label>
                    <textarea
                      value={newItem.content}
                      onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                      placeholder="メモや説明を入力"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {newItem.type === 'link' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      value={newItem.url}
                      onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {(newItem.type === 'file' || newItem.type === 'image') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ファイル
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-500 mb-2">
                        ファイルをドラッグ＆ドロップ
                      </p>
                      <p className="text-xs text-gray-400">
                        または
                      </p>
                      <button className="mt-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        ファイルを選択
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddItem}
                  disabled={!newItem.title.trim()}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  追加
                </button>
                <button
                  onClick={() => {
                    setIsAddingItem(false)
                    setNewItem({ type: 'text', title: '', content: '', url: '' })
                  }}
                  className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  キャンセル
                </button>
              </div>
            </>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* テンプレート選択モーダル */}
      {token && (
        <TemplateSelectionModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSelectTemplate={handleTemplateSelect}
          token={token}
        />
      )}
    </div>
  )
}

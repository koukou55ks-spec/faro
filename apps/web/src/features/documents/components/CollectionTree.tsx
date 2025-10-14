'use client'

import { useState } from 'react'
import { useDocumentsStore, Collection } from '../stores/documentsStore'
import { useGuestDocumentsStore, GuestCollection } from '../stores/guestDocumentsStore'
import { IconPicker } from './IconPicker'
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Edit2,
  Trash2,
  FolderPlus,
  X,
  Check,
  Smile
} from 'lucide-react'

interface CollectionTreeProps {
  collections: Collection[] | GuestCollection[]
  selectedCollectionId: string | null
  onSelectCollection: (id: string | null) => void
  authToken?: string
}

export function CollectionTree({
  collections,
  selectedCollectionId,
  onSelectCollection,
  authToken
}: CollectionTreeProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [iconPickerOpenFor, setIconPickerOpenFor] = useState<string | null>(null)

  const {
    updateCollection: updateAuthCollection,
    deleteCollection: deleteAuthCollection,
    toggleCollectionExpanded: toggleAuthExpanded
  } = useDocumentsStore()

  const {
    updateCollection: updateGuestCollection,
    deleteCollection: deleteGuestCollection,
    toggleCollectionExpanded: toggleGuestExpanded
  } = useGuestDocumentsStore()

  // Build tree structure
  const buildTree = (items: (Collection | GuestCollection)[], parentId: string | null = null): (Collection | GuestCollection)[] => {
    return items
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }

  const handleToggleExpand = (collectionId: string) => {
    if (authToken) {
      toggleAuthExpanded(collectionId)
    } else {
      toggleGuestExpanded(collectionId)
    }
  }

  const handleStartEdit = (collection: Collection | GuestCollection) => {
    setEditingId(collection.id)
    setEditingName(collection.name)
    setMenuOpenId(null)
  }

  const handleSaveEdit = async (collectionId: string) => {
    if (!editingName.trim()) {
      setEditingId(null)
      return
    }

    try {
      if (authToken) {
        await updateAuthCollection(collectionId, authToken, { name: editingName.trim() })
      } else {
        updateGuestCollection(collectionId, { name: editingName.trim() })
      }
      setEditingId(null)
    } catch (error) {
      console.error('[CollectionTree] Update error:', error)
    }
  }

  const handleDelete = async (collectionId: string) => {
    if (!confirm('このコレクションとその中のすべてのドキュメントを削除しますか?')) {
      return
    }

    try {
      if (authToken) {
        await deleteAuthCollection(collectionId, authToken)
      } else {
        deleteGuestCollection(collectionId)
      }
      setMenuOpenId(null)
      if (selectedCollectionId === collectionId) {
        onSelectCollection(null)
      }
    } catch (error) {
      console.error('[CollectionTree] Delete error:', error)
    }
  }

  const renderCollection = (collection: Collection | GuestCollection, level: number = 0) => {
    const isSelected = selectedCollectionId === collection.id
    const isEditing = editingId === collection.id
    const children = buildTree(collections, collection.id)
    const hasChildren = children.length > 0
    const isExpanded = collection.isExpanded

    return (
      <div key={collection.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors group ${
            isSelected ? 'bg-faro-purple/10 text-faro-purple' : 'hover:bg-gray-100 text-gray-700'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren ? (
            <button
              onClick={() => handleToggleExpand(collection.id)}
              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          {/* Collection Icon */}
          <button
            className="flex-shrink-0 text-lg hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation()
              setIconPickerOpenFor(collection.id)
            }}
            title="アイコンを変更"
          >
            {collection.icon}
          </button>

          {/* Collection Name */}
          {isEditing ? (
            <div className="flex-1 flex items-center gap-1">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit(collection.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
                className="flex-1 px-2 py-0.5 text-sm border border-gray-300 rounded focus:border-faro-purple focus:ring-1 focus:ring-faro-purple/20 outline-none"
                autoFocus
              />
              <button
                onClick={() => handleSaveEdit(collection.id)}
                className="p-1 hover:bg-green-100 rounded text-green-600"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="p-1 hover:bg-red-100 rounded text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => onSelectCollection(collection.id)}
              onDoubleClick={(e) => {
                e.stopPropagation()
                handleStartEdit(collection)
              }}
              className="flex-1 text-sm font-medium truncate hover:bg-gray-50 px-1 py-0.5 rounded transition-colors"
              title="ダブルクリックで編集"
            >
              {collection.name}
            </div>
          )}

          {/* Document Count */}
          {!isEditing && (
            <span className="text-xs text-gray-500">
              {(collection as Collection).documentCount || 0}
            </span>
          )}

          {/* Menu */}
          {!isEditing && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpenId(menuOpenId === collection.id ? null : collection.id)
                }}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {menuOpenId === collection.id && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleStartEdit(collection)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    名前を変更
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIconPickerOpenFor(collection.id)
                      setMenuOpenId(null)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Smile className="w-3.5 h-3.5" />
                    アイコン変更
                  </button>
                  <button
                    onClick={() => handleDelete(collection.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    削除
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div>
            {children.map(child => renderCollection(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const rootCollections = buildTree(collections, null)

  return (
    <div className="p-3 space-y-1">
      {/* All Documents */}
      <div
        onClick={() => onSelectCollection(null)}
        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
          selectedCollectionId === null ? 'bg-faro-purple/10 text-faro-purple' : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <Folder className="w-4 h-4" />
        <span className="flex-1 text-sm font-medium">すべてのドキュメント</span>
        <span className="text-xs text-gray-500">{collections.length}</span>
      </div>

      {/* Collections Tree */}
      {rootCollections.map(collection => renderCollection(collection, 0))}

      {/* Empty State */}
      {rootCollections.length === 0 && (
        <div className="text-center py-8">
          <FolderPlus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">コレクションがありません</p>
          <p className="text-xs text-gray-400 mt-1">右上の + ボタンから作成</p>
        </div>
      )}

      {/* Icon Picker Modal */}
      {iconPickerOpenFor && (
        <IconPicker
          currentIcon={collections.find(c => c.id === iconPickerOpenFor)?.icon || '📁'}
          onSelect={async (icon) => {
            try {
              if (authToken) {
                await updateAuthCollection(iconPickerOpenFor, authToken, { icon })
              } else {
                updateGuestCollection(iconPickerOpenFor, { icon })
              }
            } catch (error) {
              console.error('[CollectionTree] Icon update error:', error)
            }
          }}
          onClose={() => setIconPickerOpenFor(null)}
        />
      )}
    </div>
  )
}

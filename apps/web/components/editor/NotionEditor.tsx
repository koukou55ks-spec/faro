'use client'

import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Image as ImageIcon,
  AlignLeft,
} from 'lucide-react'

type BlockType =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bulletList'
  | 'numberedList'
  | 'todo'
  | 'quote'
  | 'code'

interface Block {
  id: string
  type: BlockType
  content: string
  checked?: boolean // for todo items
  metadata?: Record<string, unknown>
}

interface NotionEditorProps {
  initialContent?: Block[]
  onChange?: (blocks: Block[]) => void
  placeholder?: string
  autoFocus?: boolean
}

export function NotionEditor({
  initialContent = [],
  onChange,
  placeholder = '何か入力するか、\'/\' でコマンドを表示...',
  autoFocus = false,
}: NotionEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(
    initialContent.length > 0
      ? initialContent
      : [{ id: generateId(), type: 'paragraph', content: '' }]
  )
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [showCommandMenu, setShowCommandMenu] = useState(false)
  const [commandMenuPosition, setCommandMenuPosition] = useState({ top: 0, left: 0 })
  const [commandFilter, setCommandFilter] = useState('')

  useEffect(() => {
    if (onChange) {
      onChange(blocks)
    }
  }, [blocks, onChange])

  const handleBlockChange = (id: string, content: string) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, content } : block))
    )
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>, blockId: string) => {
    const block = blocks.find((b) => b.id === blockId)
    if (!block) return

    const target = e.target as HTMLTextAreaElement
    const cursorPosition = target.selectionStart

    // Enter キー: 新しいブロックを作成
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()

      const currentContent = block.content
      const beforeCursor = currentContent.slice(0, cursorPosition)
      const afterCursor = currentContent.slice(cursorPosition)

      // 現在のブロックを分割
      setBlocks((prev) => {
        const index = prev.findIndex((b) => b.id === blockId)
        const newBlock: Block = {
          id: generateId(),
          type: 'paragraph',
          content: afterCursor,
        }

        const updated = [...prev]
        updated[index] = { ...block, content: beforeCursor }
        updated.splice(index + 1, 0, newBlock)
        return updated
      })

      // 新しいブロックにフォーカスを移動
      setTimeout(() => {
        const newBlockElement = document.querySelector(
          `[data-block-id="${blocks[blocks.findIndex((b) => b.id === blockId) + 1]?.id}"]`
        ) as HTMLTextAreaElement
        newBlockElement?.focus()
      }, 0)
    }

    // Backspace キー: 空のブロックを削除
    if (e.key === 'Backspace' && block.content === '' && blocks.length > 1) {
      e.preventDefault()
      setBlocks((prev) => {
        const index = prev.findIndex((b) => b.id === blockId)
        if (index > 0) {
          const updated = prev.filter((b) => b.id !== blockId)
          // 前のブロックにフォーカスを移動
          setTimeout(() => {
            const prevBlockElement = document.querySelector(
              `[data-block-id="${updated[index - 1].id}"]`
            ) as HTMLTextAreaElement
            if (prevBlockElement) {
              prevBlockElement.focus()
              prevBlockElement.selectionStart = prevBlockElement.value.length
            }
          }, 0)
          return updated
        }
        return prev
      })
    }

    // "/" コマンドメニューを表示
    if (e.key === '/' && block.content === '') {
      e.preventDefault()
      setShowCommandMenu(true)
      setCommandFilter('')
      const rect = target.getBoundingClientRect()
      setCommandMenuPosition({ top: rect.bottom, left: rect.left })
    }

    // スラッシュコマンド入力中
    if (block.content.startsWith('/') && block.content.length > 1) {
      setCommandFilter(block.content.slice(1))
      setShowCommandMenu(true)
      const rect = target.getBoundingClientRect()
      setCommandMenuPosition({ top: rect.bottom, left: rect.left })
    } else if (!block.content.startsWith('/')) {
      setShowCommandMenu(false)
    }
  }

  const insertBlockType = (blockId: string, type: BlockType) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, type, content: '' } : block
      )
    )
    setShowCommandMenu(false)
    setCommandFilter('')

    // フォーカスを戻す
    setTimeout(() => {
      const blockElement = document.querySelector(
        `[data-block-id="${blockId}"]`
      ) as HTMLTextAreaElement
      blockElement?.focus()
    }, 0)
  }

  const toggleTodo = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, checked: !block.checked } : block
      )
    )
  }

  const getPlaceholderText = (type: BlockType): string => {
    switch (type) {
      case 'h1':
        return '見出し1'
      case 'h2':
        return '見出し2'
      case 'h3':
        return '見出し3'
      case 'bulletList':
        return 'リスト'
      case 'numberedList':
        return '番号付きリスト'
      case 'todo':
        return 'ToDoリスト'
      case 'quote':
        return '引用'
      case 'code':
        return 'コード'
      default:
        return placeholder
    }
  }

  const commands = [
    { type: 'h1' as BlockType, label: '見出し1', icon: Heading1, keywords: ['h1', 'heading1'] },
    { type: 'h2' as BlockType, label: '見出し2', icon: Heading2, keywords: ['h2', 'heading2'] },
    { type: 'h3' as BlockType, label: '見出し3', icon: Heading3, keywords: ['h3', 'heading3'] },
    {
      type: 'bulletList' as BlockType,
      label: '箇条書きリスト',
      icon: List,
      keywords: ['ul', 'list', 'bullet'],
    },
    {
      type: 'numberedList' as BlockType,
      label: '番号付きリスト',
      icon: ListOrdered,
      keywords: ['ol', 'numbered'],
    },
    { type: 'todo' as BlockType, label: 'ToDoリスト', icon: CheckSquare, keywords: ['todo', 'checkbox'] },
    { type: 'quote' as BlockType, label: '引用', icon: Quote, keywords: ['quote', 'blockquote'] },
    { type: 'code' as BlockType, label: 'コード', icon: Code, keywords: ['code', 'pre'] },
    { type: 'paragraph' as BlockType, label: 'テキスト', icon: AlignLeft, keywords: ['text', 'paragraph'] },
  ]

  const filteredCommands = commandFilter
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(commandFilter.toLowerCase()) ||
          cmd.keywords.some((kw) => kw.includes(commandFilter.toLowerCase()))
      )
    : commands

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {blocks.map((block, index) => (
        <BlockComponent
          key={block.id}
          block={block}
          index={index}
          onContentChange={handleBlockChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocusedBlockId(block.id)}
          onToggleTodo={toggleTodo}
          placeholder={getPlaceholderText(block.type)}
          autoFocus={autoFocus && index === 0}
        />
      ))}

      {/* スラッシュコマンドメニュー */}
      {showCommandMenu && (
        <div
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-64 md:w-72 max-h-80 overflow-y-auto"
          style={{ top: commandMenuPosition.top, left: commandMenuPosition.left }}
        >
          <div className="p-2 text-xs text-gray-500 border-b border-gray-100">
            ブロックタイプを選択
          </div>
          {filteredCommands.map((cmd) => {
            const Icon = cmd.icon
            return (
              <button
                key={cmd.type}
                onClick={() => focusedBlockId && insertBlockType(focusedBlockId, cmd.type)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 transition-colors text-left"
              >
                <Icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">{cmd.label}</div>
                  <div className="text-xs text-gray-500">{cmd.type}</div>
                </div>
              </button>
            )
          })}
          {filteredCommands.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              該当するコマンドがありません
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface BlockComponentProps {
  block: Block
  index: number
  onContentChange: (id: string, content: string) => void
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>, blockId: string) => void
  onFocus: () => void
  onToggleTodo: (blockId: string) => void
  placeholder: string
  autoFocus: boolean
}

function BlockComponent({
  block,
  index,
  onContentChange,
  onKeyDown,
  onFocus,
  onToggleTodo,
  placeholder,
  autoFocus,
}: BlockComponentProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自動リサイズ
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [block.content])

  const getTextStyle = () => {
    switch (block.type) {
      case 'h1':
        return 'text-2xl md:text-4xl font-bold'
      case 'h2':
        return 'text-xl md:text-3xl font-bold'
      case 'h3':
        return 'text-lg md:text-2xl font-bold'
      case 'quote':
        return 'text-base md:text-lg italic border-l-4 border-faro-purple pl-4'
      case 'code':
        return 'font-mono text-xs md:text-sm bg-gray-100 rounded px-2 py-1'
      default:
        return 'text-sm md:text-base'
    }
  }

  const getPrefix = () => {
    switch (block.type) {
      case 'bulletList':
        return '• '
      case 'numberedList':
        return `${index + 1}. `
      case 'todo':
        return (
          <button
            onClick={() => onToggleTodo(block.id)}
            className="mr-2 flex-shrink-0 w-5 h-5 border-2 border-gray-400 rounded hover:border-faro-purple transition-colors flex items-center justify-center"
          >
            {block.checked && (
              <div className="w-3 h-3 bg-faro-purple rounded-sm" />
            )}
          </button>
        )
      default:
        return null
    }
  }

  const prefix = getPrefix()
  const showCheckbox = block.type === 'todo'

  return (
    <div className="group flex items-start gap-2 py-2 px-2 hover:bg-gray-50 rounded-lg transition-colors">
      {showCheckbox && prefix}
      <textarea
        ref={textareaRef}
        data-block-id={block.id}
        value={block.content}
        onChange={(e) => onContentChange(block.id, e.target.value)}
        onKeyDown={(e) => onKeyDown(e, block.id)}
        onFocus={onFocus}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`flex-1 bg-transparent border-none outline-none resize-none overflow-hidden ${getTextStyle()} ${
          block.checked ? 'line-through text-gray-400' : 'text-gray-900'
        } placeholder-gray-400`}
        rows={1}
      />
      {!showCheckbox && typeof prefix === 'string' && (
        <span className="absolute left-0 text-gray-400 select-none pointer-events-none">
          {prefix}
        </span>
      )}
    </div>
  )
}

function generateId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

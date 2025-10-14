import { useEffect, useCallback } from 'react'

interface UseAccessibilityOptions {
  enableKeyboardShortcuts?: boolean
  enableFocusTrap?: boolean
  enableAriaAnnouncements?: boolean
  enableHighContrast?: boolean
}

export function useAccessibility(options: UseAccessibilityOptions = {}) {
  const {
    enableKeyboardShortcuts = true,
    enableFocusTrap = false,
    enableAriaAnnouncements = true,
    enableHighContrast = false,
  } = options

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardShortcuts) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in input
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return
      }

      // Global shortcuts
      switch (e.key) {
        case '/':
          // Focus search
          e.preventDefault()
          const searchInput = document.querySelector('[role="search"] input') as HTMLInputElement
          searchInput?.focus()
          break

        case 'Escape':
          // Close modals/dialogs
          const modal = document.querySelector('[role="dialog"]') as HTMLElement
          if (modal) {
            e.preventDefault()
            const closeButton = modal.querySelector('[aria-label*="close" i], [aria-label*="閉じる"]') as HTMLButtonElement
            closeButton?.click()
          }
          break

        case 'n':
          if (e.ctrlKey || e.metaKey) {
            // New chat shortcut
            e.preventDefault()
            const newChatButton = document.querySelector('[aria-label*="新規" i], [aria-label*="new" i]') as HTMLButtonElement
            newChatButton?.click()
          }
          break

        case '?':
          if (e.shiftKey) {
            // Show keyboard shortcuts help
            e.preventDefault()
            showKeyboardShortcuts()
          }
          break
      }

      // Navigation with arrow keys
      if (e.key.startsWith('Arrow')) {
        const focusableElements = getFocusableElements()
        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)

        let nextIndex = currentIndex
        switch (e.key) {
          case 'ArrowDown':
            nextIndex = (currentIndex + 1) % focusableElements.length
            break
          case 'ArrowUp':
            nextIndex = currentIndex - 1 < 0 ? focusableElements.length - 1 : currentIndex - 1
            break
        }

        if (nextIndex !== currentIndex && focusableElements[nextIndex]) {
          e.preventDefault()
          focusableElements[nextIndex].focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enableKeyboardShortcuts])

  // Focus trap for modals
  useEffect(() => {
    if (!enableFocusTrap) return

    const trapFocus = (e: KeyboardEvent) => {
      const modal = document.querySelector('[role="dialog"]') as HTMLElement
      if (!modal) return

      const focusableElements = getFocusableElements(modal)
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', trapFocus)
    return () => document.removeEventListener('keydown', trapFocus)
  }, [enableFocusTrap])

  // ARIA live announcements
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!enableAriaAnnouncements) return

    const announcer = document.createElement('div')
    announcer.setAttribute('role', 'status')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.style.position = 'absolute'
    announcer.style.left = '-10000px'
    announcer.style.width = '1px'
    announcer.style.height = '1px'
    announcer.style.overflow = 'hidden'

    announcer.textContent = message
    document.body.appendChild(announcer)

    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }, [enableAriaAnnouncements])

  // High contrast mode
  useEffect(() => {
    if (enableHighContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [enableHighContrast])

  // Skip links
  const addSkipLinks = useCallback(() => {
    const skipNav = document.createElement('a')
    skipNav.href = '#main-content'
    skipNav.className = 'skip-link'
    skipNav.textContent = 'メインコンテンツへスキップ'
    skipNav.style.cssText = `
      position: absolute;
      left: -9999px;
      z-index: 999;
      padding: 1em;
      background: #000;
      color: #fff;
      text-decoration: none;
    `

    skipNav.addEventListener('focus', () => {
      skipNav.style.left = '0'
    })

    skipNav.addEventListener('blur', () => {
      skipNav.style.left = '-9999px'
    })

    document.body.insertBefore(skipNav, document.body.firstChild)
  }, [])

  useEffect(() => {
    addSkipLinks()
  }, [addSkipLinks])

  return {
    announce,
    getFocusableElements,
    showKeyboardShortcuts,
  }
}

// Helper functions
function getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  return Array.from(container.querySelectorAll(selector)) as HTMLElement[]
}

function showKeyboardShortcuts() {
  const shortcuts = [
    { key: '/', description: '検索にフォーカス' },
    { key: 'Ctrl/Cmd + N', description: '新規チャット' },
    { key: 'Escape', description: 'ダイアログを閉じる' },
    { key: '↑↓', description: 'ナビゲーション' },
    { key: 'Shift + ?', description: 'このヘルプを表示' },
  ]

  const modal = document.createElement('div')
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-label', 'キーボードショートカット')
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    z-index: 10000;
    max-width: 400px;
    width: 90%;
  `

  const title = document.createElement('h2')
  title.textContent = 'キーボードショートカット'
  title.style.marginBottom = '1rem'
  modal.appendChild(title)

  const list = document.createElement('dl')
  shortcuts.forEach(({ key, description }) => {
    const dt = document.createElement('dt')
    dt.style.cssText = 'display: inline-block; width: 40%; font-weight: bold; margin-bottom: 0.5rem;'
    dt.textContent = key

    const dd = document.createElement('dd')
    dd.style.cssText = 'display: inline-block; width: 60%; margin-bottom: 0.5rem; margin-left: 0;'
    dd.textContent = description

    list.appendChild(dt)
    list.appendChild(dd)
  })
  modal.appendChild(list)

  const closeButton = document.createElement('button')
  closeButton.textContent = '閉じる'
  closeButton.setAttribute('aria-label', '閉じる')
  closeButton.style.cssText = `
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `
  closeButton.onclick = () => {
    document.body.removeChild(backdrop)
    document.body.removeChild(modal)
  }
  modal.appendChild(closeButton)

  const backdrop = document.createElement('div')
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
  `
  backdrop.onclick = closeButton.onclick

  document.body.appendChild(backdrop)
  document.body.appendChild(modal)
  closeButton.focus()
}
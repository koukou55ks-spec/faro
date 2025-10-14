'use client'

import { useState, useEffect } from 'react'
import { NotebookLMHomePage } from './NotebookLMHomePage'

interface NotebookLMViewProps {
  authToken?: string
  isGuest?: boolean
}

export function NotebookLMView({ authToken, isGuest = false }: NotebookLMViewProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile-first: Always show NotebookLM homepage style
  return (
    <div className="h-full w-full overflow-auto">
      <NotebookLMHomePage authToken={authToken} isGuest={isGuest} />
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { ChatPanel } from '@/components/workspace/ChatPanel'
import { NotesPanel } from '@/components/workspace/NotesPanel'
import { LawSearchPanel } from '@/components/workspace/LawSearchPanel'
import { Sidebar } from '@/components/workspace/Sidebar'

export default function WorkspacePage() {
  const { user, loading } = useAuth()
  const [activePanel, setActivePanel] = useState<'chat' | 'notes' | 'law'>('chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Sidebar
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
      />

      <main className="main-content">
        {activePanel === 'chat' && <ChatPanel userId={user?.id} />}
        {activePanel === 'notes' && <NotesPanel userId={user?.id} />}
        {activePanel === 'law' && <LawSearchPanel />}
      </main>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #f8fafc;
          --bg-tertiary: #f1f5f9;
          --bg-sidebar: #0f172a;
          --bg-hover: #e2e8f0;

          --accent-primary: #0891b2;
          --accent-secondary: #7c3aed;
          --accent-success: #10b981;
          --accent-warning: #f59e0b;
          --accent-danger: #ef4444;

          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-tertiary: #94a3b8;
          --text-sidebar: #f8fafc;

          --border: #e2e8f0;
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          --transition: 200ms ease;
        }

        [data-theme="dark"] {
          --bg-primary: #0a0a0f;
          --bg-secondary: #13131a;
          --bg-tertiary: #1a1a24;
          --bg-sidebar: #13131a;
          --bg-hover: rgba(255, 255, 255, 0.1);

          --text-primary: #f9fafb;
          --text-secondary: #d1d5db;
          --text-tertiary: #9ca3af;
          --text-sidebar: #f9fafb;

          --border: rgba(255, 255, 255, 0.1);
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg-secondary);
          color: var(--text-primary);
          line-height: 1.6;
          overflow: hidden;
          transition: background 0.3s, color 0.3s;
        }

        .app-container {
          display: flex;
          height: 100vh;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

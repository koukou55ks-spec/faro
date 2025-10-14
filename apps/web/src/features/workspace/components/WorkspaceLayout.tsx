'use client'

import { useState } from 'react'
import { ChatPanel } from '../../chat/components/ChatPanel'
import { NotesPanel } from '../../notes/components/NotesPanel'

interface WorkspaceLayoutProps {
  userId: string
}

type ActivePanel = 'chat' | 'notes'

export function WorkspaceLayout({ userId }: WorkspaceLayoutProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>('chat')

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">Faro</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-Powered Financial OS</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActivePanel('chat')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              activePanel === 'chat'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-accent text-foreground'
            }`}
          >
            <span className="text-xl">💬</span>
            <span className="font-medium">Chat</span>
          </button>

          <button
            onClick={() => setActivePanel('notes')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              activePanel === 'notes'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-accent text-foreground'
            }`}
          >
            <span className="text-xl">📝</span>
            <span className="font-medium">Notes</span>
          </button>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">User</p>
              <p className="text-xs text-muted-foreground truncate">{userId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activePanel === 'chat' && <ChatPanel userId={userId} />}
        {activePanel === 'notes' && <NotesPanel userId={userId} />}
      </div>
    </div>
  )
}

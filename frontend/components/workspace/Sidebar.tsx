'use client'

interface SidebarProps {
  activePanel: 'chat' | 'notes' | 'law'
  setActivePanel: (panel: 'chat' | 'notes' | 'law') => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
  user: any
}

export function Sidebar({
  activePanel,
  setActivePanel,
  sidebarOpen,
  setSidebarOpen,
  theme,
  toggleTheme,
  user
}: SidebarProps) {
  return (
    <aside className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">💼</span>
          <span className="logo-text">Faro</span>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activePanel === 'chat' ? 'active' : ''}`}
          onClick={() => setActivePanel('chat')}
        >
          <i className="fas fa-comments"></i>
          <span>チャット</span>
        </button>
        <button
          className={`nav-item ${activePanel === 'notes' ? 'active' : ''}`}
          onClick={() => setActivePanel('notes')}
        >
          <i className="fas fa-note-sticky"></i>
          <span>ノート</span>
        </button>
        <button
          className={`nav-item ${activePanel === 'law' ? 'active' : ''}`}
          onClick={() => setActivePanel('law')}
        >
          <i className="fas fa-gavel"></i>
          <span>法令検索</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="user-info">
            <div className="user-avatar">{user.email?.[0]?.toUpperCase() || 'U'}</div>
            <div className="user-details">
              <div className="user-email">{user.email}</div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .sidebar {
          width: 260px;
          background: var(--bg-sidebar);
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border);
          transition: transform 0.3s ease;
        }

        .sidebar.collapsed {
          transform: translateX(-100%);
        }

        .sidebar-header {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--text-sidebar);
          font-family: 'Space Grotesk', sans-serif;
        }

        .logo-icon {
          font-size: 2rem;
        }

        .theme-toggle {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: var(--text-sidebar);
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition);
        }

        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
        }

        .nav-item {
          width: 100%;
          padding: 0.875rem 1rem;
          margin-bottom: 0.5rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--text-sidebar);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: all var(--transition);
          text-align: left;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-item.active {
          background: var(--accent-primary);
          color: white;
        }

        .nav-item i {
          font-size: 1.2rem;
          width: 24px;
          text-align: center;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .user-email {
          color: var(--text-sidebar);
          font-size: 0.85rem;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </aside>
  )
}

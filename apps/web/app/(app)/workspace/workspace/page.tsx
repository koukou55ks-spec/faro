'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { WorkspaceLayout } from '@/src/features/workspace'

export default function WorkspacePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">認証が必要です</h2>
          <p className="text-muted-foreground">ログインしてください</p>
        </div>
      </div>
    )
  }

  return <WorkspaceLayout userId={user.id} />
}

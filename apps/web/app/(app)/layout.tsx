'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/hooks/useAuth'
import { Sparkles } from 'lucide-react'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // Allow guest access for MVP - disable auth check
    // if (!loading && !user) {
    //   router.push('/login')
    // }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="animate-spin">
          <Sparkles className="w-12 h-12 text-violet-500" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}

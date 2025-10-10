'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { motion } from 'framer-motion'
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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-violet-500" />
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}

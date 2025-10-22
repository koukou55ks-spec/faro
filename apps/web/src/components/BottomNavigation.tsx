'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  MessageSquare,
  Search,
  Calculator,
  User,
  Users
} from 'lucide-react'
import { motion } from 'framer-motion'

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  path: string
  badge?: number
}

const navItems: NavItem[] = [
  { icon: MessageSquare, label: 'ホーム', path: '/' },
  { icon: Search, label: 'さがす', path: '/search' },
  { icon: Calculator, label: 'ツール', path: '/tools' },
  { icon: User, label: 'マイページ', path: '/mypage' },
  { icon: Users, label: 'つながる', path: '/connect' }
]

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex justify-around items-center h-16 px-2 max-w-screen-sm mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/')

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center flex-1 py-2 px-1 relative"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs mt-1 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
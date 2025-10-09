'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  MessageCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Bell
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  date: string
  event_type: 'transaction' | 'deadline' | 'reminder' | 'custom'
  is_auto_generated: boolean
  color: string | null
  transaction_id: string | null
}

export default function CalendarPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showFaroChat, setShowFaroChat] = useState(false)

  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user, currentDate])

  const loadEvents = async () => {
    try {
      const supabase = createClient()

      // 現在の月の最初と最後の日付
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', firstDay.toISOString().split('T')[0])
        .lte('date', lastDay.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error loading events:', error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const days: Date[] = []

    // 前月の日付で埋める
    const firstDayOfWeek = firstDay.getDay()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push(prevDate)
    }

    // 今月の日付
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    // 次月の日付で埋める（42日分になるように）
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter((event) => event.date === dateStr)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/workspace-new')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Workspace</span>
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-bold text-gray-900">カレンダー</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
              className="text-sm"
            >
              今日
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Month Navigation */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={handlePrevMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
              </h2>
              <Button variant="ghost" onClick={handleNextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Week Day Headers */}
              {weekDays.map((day, index) => (
                <div
                  key={day}
                  className={`text-center text-sm font-semibold py-2 ${
                    index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {days.map((date, index) => {
                const dayEvents = getEventsForDate(date)
                const isCurrentMonthDay = isCurrentMonth(date)
                const isTodayDate = isToday(date)

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`
                      relative min-h-[100px] p-2 rounded-lg border transition-all
                      ${isCurrentMonthDay ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'}
                      ${isTodayDate ? 'border-2 border-purple-600' : 'border-gray-200'}
                      ${selectedDate?.toDateString() === date.toDateString() ? 'ring-2 ring-purple-400' : ''}
                    `}
                  >
                    <div
                      className={`text-sm font-semibold mb-1 ${
                        isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
                      } ${isTodayDate ? 'text-purple-600' : ''}`}
                    >
                      {date.getDate()}
                    </div>

                    {/* Events */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs px-1 py-0.5 rounded truncate"
                          style={{
                            backgroundColor: event.color || '#e5e7eb',
                            color: event.color ? '#ffffff' : '#374151'
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 3}件
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Event List for Selected Date */}
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getEventsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>この日の予定はありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: event.color || '#e5e7eb' }}
                      >
                        {event.event_type === 'transaction' ? (
                          event.color === '#10b981' ? (
                            <TrendingUp className="w-6 h-6 text-white" />
                          ) : (
                            <TrendingDown className="w-6 h-6 text-white" />
                          )
                        ) : event.event_type === 'deadline' ? (
                          <Bell className="w-6 h-6 text-white" />
                        ) : (
                          <CalendarIcon className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-gray-600">{event.description}</p>
                        )}
                        {event.is_auto_generated && (
                          <p className="text-xs text-gray-400 mt-1">
                            自動生成（取引から）
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-8 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>自動記入機能:</strong>
                  家計簿アプリで取引を追加すると、自動的にカレンダーに記録されます。
                </p>
                <p className="text-xs text-gray-500">
                  収入は緑、支出は赤で表示されます。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Floating Faro Button */}
      <button
        onClick={() => setShowFaroChat(!showFaroChat)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 z-50"
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </button>

      {/* Faro Mini Chat */}
      {showFaroChat && (
        <div className="fixed bottom-28 right-8 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Faro</span>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            カレンダーを見ると、支出のパターンが見えてきますね。何か気になることはありますか？
          </p>
          <Button
            onClick={() => router.push('/faro')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            詳しく相談する
          </Button>
        </div>
      )}
    </div>
  )
}

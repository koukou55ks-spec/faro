'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Award, Calculator, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { QuizPlayer } from '../../../components/features/quiz/QuizPlayer'
import { TaxSimulator } from '../../../components/features/simulator/TaxSimulator'
import type { QuizContent, QuizResult } from '../../../types/library'

export default function LibraryContentPage() {
  const params = useParams()
  const router = useRouter()
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quizStarted, setQuizStarted] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/library/${params.id}`)
        if (!response.ok) {
          throw new Error('コンテンツの取得に失敗しました')
        }
        const data = await response.json()
        setContent(data.content)
      } catch (err) {
        console.error('Failed to fetch content:', err)
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchContent()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            コンテンツが見つかりません
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'このコンテンツは存在しないか、削除された可能性があります'}
          </p>
          <Link
            href="/library"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
          >
            ライブラリに戻る
          </Link>
        </div>
      </div>
    )
  }

  const getTypeIcon = () => {
    switch (content.content_type) {
      case 'article': return BookOpen
      case 'quiz': return Award
      case 'simulation': return Calculator
      default: return BookOpen
    }
  }

  const TypeIcon = getTypeIcon()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black pb-20">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">戻る</span>
          </button>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <TypeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {content.title}
              </h1>
              {content.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {content.description}
                </p>
              )}
              <div className="flex flex-wrap gap-3 text-sm">
                {content.category && (
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    {content.category}
                  </span>
                )}
                {content.difficulty && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                    {content.difficulty === 'beginner' && '初級'}
                    {content.difficulty === 'intermediate' && '中級'}
                    {content.difficulty === 'advanced' && '上級'}
                  </span>
                )}
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  約{Math.ceil(content.content.length / 500)}分
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツ本体 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8"
        >
          {content.content_type === 'article' && (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: content.content.replace(/\n/g, '<br />') }}
                className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
              />
            </div>
          )}

          {content.content_type === 'quiz' && (
            <>
              {!quizStarted ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    クイズに挑戦
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {content.description || '税金に関する知識をテストしましょう'}
                  </p>
                  <button
                    onClick={() => setQuizStarted(true)}
                    className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors text-lg"
                  >
                    クイズを開始
                  </button>
                </div>
              ) : (
                <QuizPlayer
                  quiz={JSON.parse(content.content) as QuizContent}
                  onComplete={async (result: QuizResult) => {
                    try {
                      await fetch(`/api/library/${params.id}/progress`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          status: 'completed',
                          progress_percentage: 100,
                          score: result.score,
                          result_data: result
                        })
                      })
                    } catch (err) {
                      console.error('Failed to save quiz result:', err)
                    }
                  }}
                />
              )}
            </>
          )}

          {content.content_type === 'simulation' && (
            <TaxSimulator
              onComplete={async (result) => {
                try {
                  await fetch(`/api/library/${params.id}/progress`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      status: 'completed',
                      progress_percentage: 100,
                      result_data: result
                    })
                  })
                } catch (err) {
                  console.error('Failed to save simulation result:', err)
                }
              }}
            />
          )}

          {/* 完了ボタン */}
          {content.content_type === 'article' && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={async () => {
                  try {
                    await fetch(`/api/library/${params.id}/progress`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        status: 'completed',
                        progress_percentage: 100
                      })
                    })
                    router.push('/library')
                  } catch (err) {
                    console.error('Failed to update progress:', err)
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                読み終えた
              </button>
            </div>
          )}
        </motion.div>

        {/* 関連コンテンツ（将来実装） */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            関連コンテンツ
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            関連するコンテンツは準備中です
          </p>
        </div>
      </div>
    </div>
  )
}

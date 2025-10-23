'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle2, XCircle, Trophy, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface QuizViewProps {
  moduleId: string
  moduleTitle: string
  onBack: () => void
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface QuizModule {
  questions: QuizQuestion[]
  completionMessage: string
}

// クイズデータ
const QUIZ_DATA: Record<string, QuizModule> = {
  // 「控除」って何？1分クイズ
  'quiz-deduction-basics': {
    questions: [
      {
        id: 'q1',
        question: '「控除」とは何ですか？',
        options: [
          'お金がもらえる制度',
          '税金が減る制度',
          '税金が増える制度'
        ],
        correctIndex: 1,
        explanation: '正解！控除とは「税金が減る制度」です。所得から差し引くことで、課税対象額が減ります。'
      },
      {
        id: 'q2',
        question: 'ふるさと納税は何控除？',
        options: [
          '所得控除',
          '税額控除',
          '扶養控除'
        ],
        correctIndex: 1,
        explanation: '正解！ふるさと納税は「税額控除」です。計算された税額から直接差し引かれます。'
      },
      {
        id: 'q3',
        question: '103万円の壁は何の控除に関係する？',
        options: [
          '基礎控除',
          '給与所得控除',
          '配偶者控除'
        ],
        correctIndex: 2,
        explanation: '正解！103万円の壁は「配偶者控除」に関係します。103万円を超えると配偶者控除が減り始めます。'
      }
    ],
    completionMessage: '控除の基本が理解できましたね！この知識があれば、節税戦略を立てやすくなります。'
  },

  // 103万 vs 130万、どっちが「税金」の壁？
  'quiz-wall-103-vs-130': {
    questions: [
      {
        id: 'q1',
        question: '103万円の壁は何の壁？',
        options: [
          '税金',
          '社会保険',
          '両方'
        ],
        correctIndex: 0,
        explanation: '正解！103万円の壁は「税金」の壁です。103万円を超えると、あなた自身に所得税がかかり始めます。'
      },
      {
        id: 'q2',
        question: '130万円の壁は何の壁？',
        options: [
          '税金',
          '社会保険',
          '両方'
        ],
        correctIndex: 1,
        explanation: '正解！130万円の壁は「社会保険」の壁です。130万円を超えると、健康保険と厚生年金に加入義務が発生します。'
      },
      {
        id: 'q3',
        question: '「手取りが減る谷」が最も深いのはどっち？',
        options: [
          '103万円',
          '130万円',
          'どちらも同じ'
        ],
        correctIndex: 1,
        explanation: '正解！130万円の壁の方が深いです。社会保険料（年間約22万円）が発生するため、手取りが大きく減ります。'
      }
    ],
    completionMessage: '扶養の壁を完全に理解できましたね！次は「シミュレーター」で実際の数字を体験しましょう。'
  },

  // 白色申告 vs 青色申告、あなたはどっち？
  'quiz-white-vs-blue': {
    questions: [
      {
        id: 'q1',
        question: '帳簿をつけるのが面倒。簡単な方がいい。',
        options: [
          '白色申告',
          '青色申告',
          'どちらでも'
        ],
        correctIndex: 0,
        explanation: '白色申告が向いています。帳簿が簡易で、確定申告の準備が楽です。'
      },
      {
        id: 'q2',
        question: '最大65万円の控除を受けたい。',
        options: [
          '白色申告',
          '青色申告',
          'どちらでも'
        ],
        correctIndex: 1,
        explanation: '青色申告が必要です。複式簿記で記帳すれば、最大65万円の特別控除が受けられます。'
      },
      {
        id: 'q3',
        question: '赤字を3年間繰り越したい。',
        options: [
          '白色申告',
          '青色申告',
          'どちらでも'
        ],
        correctIndex: 1,
        explanation: '青色申告が必要です。青色申告なら、赤字を3年間繰り越して将来の黒字と相殺できます。'
      }
    ],
    completionMessage: 'あなたに合った申告方法が見つかりましたね！青色申告は手間がかかりますが、節税効果は抜群です。'
  },

  // 新NISA vs 旧NISA、どう違う？
  'quiz-nisa-old-vs-new': {
    questions: [
      {
        id: 'q1',
        question: '新NISAの生涯投資枠はいくら？',
        options: [
          '600万円',
          '1200万円',
          '1800万円'
        ],
        correctIndex: 2,
        explanation: '正解！新NISAの生涯投資枠は1800万円です。旧NISAの600万円から3倍に拡大しました。'
      },
      {
        id: 'q2',
        question: '新NISAの非課税期間は？',
        options: [
          '5年',
          '20年',
          '無期限'
        ],
        correctIndex: 2,
        explanation: '正解！新NISAの非課税期間は無期限です。一度投資すれば、売却するまでずっと非課税です。'
      },
      {
        id: 'q3',
        question: '新NISAで売却した枠は再利用できる？',
        options: [
          'できる',
          'できない',
          '翌年のみ可能'
        ],
        correctIndex: 0,
        explanation: '正解！新NISAでは、売却した枠を翌年に再利用できます。これが旧NISAとの大きな違いです。'
      }
    ],
    completionMessage: '新NISAの威力が理解できましたね！次は「シミュレーター」で30年後の資産を計算してみましょう。'
  },

  // セルフメディケーション税制って何？
  'quiz-medical-celmedication': {
    questions: [
      {
        id: 'q1',
        question: 'セルフメディケーション税制の対象は？',
        options: [
          '病院の診察費',
          '特定の市販薬',
          'サプリメント'
        ],
        correctIndex: 1,
        explanation: '正解！対象は「特定の市販薬」です。スイッチOTC医薬品（処方薬から市販薬に転用された薬）が該当します。'
      },
      {
        id: 'q2',
        question: 'セルフメディケーション税制の基準額は？',
        options: [
          '1万2千円',
          '5万円',
          '10万円'
        ],
        correctIndex: 0,
        explanation: '正解！年間1万2千円を超えた分が控除対象です。医療費控除（10万円）より低いハードルが魅力です。'
      },
      {
        id: 'q3',
        question: '医療費控除とセルフメディケーション税制は併用できる？',
        options: [
          'できる',
          'できない',
          '条件付きで可能'
        ],
        correctIndex: 1,
        explanation: '正解！併用できません。どちらか一方を選択する必要があります。お得な方を選びましょう。'
      }
    ],
    completionMessage: 'セルフメディケーション税制をマスターしましたね！市販薬のレシートは必ず保管しましょう。'
  }
}

export function QuizView({ moduleId, moduleTitle, onBack }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const quizModule = QUIZ_DATA[moduleId]
  const currentQuestion = quizModule?.questions[currentQuestionIndex]
  const totalQuestions = quizModule?.questions.length || 0
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  useEffect(() => {
    // Reset when module changes
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setCorrectCount(0)
    setIsCompleted(false)
  }, [moduleId])

  const handleSelectAnswer = (index: number) => {
    if (showExplanation) return
    setSelectedAnswer(index)
  }

  const handleSubmit = () => {
    if (selectedAnswer === null) return
    setShowExplanation(true)
    if (selectedAnswer === currentQuestion.correctIndex) {
      setCorrectCount(prev => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setIsCompleted(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setCorrectCount(0)
    setIsCompleted(false)
  }

  if (!quizModule) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            このクイズは準備中です
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

  // 完了画面
  if (isCompleted) {
    const score = Math.round((correctCount / totalQuestions) * 100)
    const isPerfect = correctCount === totalQuestions

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 dark:from-gray-900 dark:to-black flex flex-col">
        <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">戻る</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl text-center"
          >
            <div className="mb-6">
              {isPerfect ? (
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
              ) : (
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              )}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {isPerfect ? '🎉 パーフェクト！' : 'クイズ完了！'}
            </h2>

            <div className="mb-6">
              <p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 mb-2">
                {correctCount}/{totalQuestions}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                正解率 {score}%
              </p>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              {quizModule.completionMessage}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleRestart}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>もう一度挑戦</span>
              </button>
              <button
                onClick={onBack}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-colors"
              >
                戻る
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // クイズ画面
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">戻る</span>
            </button>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                クイズ
              </span>
            </div>
          </div>

          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
            {moduleTitle}
          </h1>

          {/* Progress */}
          <div className="relative h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>問題 {currentQuestionIndex + 1}/{totalQuestions}</span>
            <span>{correctCount}問正解</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Question Text */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentQuestion?.question}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  正解だと思うものを選択してください
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion?.options.map((option, index) => {
                  const isSelected = selectedAnswer === index
                  const isCorrect = index === currentQuestion.correctIndex
                  const showResult = showExplanation

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectAnswer(index)}
                      disabled={showExplanation}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : isSelected
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                          : isSelected
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                      } ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 dark:text-white font-medium">
                          {option}
                        </span>
                        {showResult && isCorrect && (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl ${
                    selectedAnswer === currentQuestion.correctIndex
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <p className="text-gray-700 dark:text-gray-300">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {!showExplanation ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg transition-all"
            >
              回答する
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>{currentQuestionIndex < totalQuestions - 1 ? '次の問題へ' : '結果を見る'}</span>
              <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

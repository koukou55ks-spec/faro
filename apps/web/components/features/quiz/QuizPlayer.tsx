'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { QuizContent, QuizResult } from '../../../types/library'

interface QuizPlayerProps {
  quiz: QuizContent
  onComplete: (result: QuizResult) => void
}

export function QuizPlayer({ quiz, onComplete }: QuizPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [startTime] = useState(Date.now())

  const question = quiz.questions[currentQuestion]
  const isLastQuestion = currentQuestion === quiz.questions.length - 1

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNext = () => {
    if (selectedAnswer === null) return

    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)

    if (isLastQuestion) {
      // クイズ完了
      const correctCount = newAnswers.filter(
        (answer, index) => answer === quiz.questions[index].correct_answer
      ).length
      const score = Math.round((correctCount / quiz.questions.length) * 100)
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)

      const result: QuizResult = {
        answers: newAnswers,
        score,
        correct_count: correctCount,
        total_count: quiz.questions.length,
        time_spent: timeSpent
      }

      setShowResult(true)
      onComplete(result)
    } else {
      // 次の問題へ
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setSelectedAnswer(null)
    setShowResult(false)
  }

  if (showResult) {
    const correctCount = answers.filter(
      (answer, index) => answer === quiz.questions[index].correct_answer
    ).length
    const score = Math.round((correctCount / quiz.questions.length) * 100)
    const passed = quiz.passing_score ? score >= quiz.passing_score : score >= 60

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
              passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
            }`}>
              {passed ? (
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-12 h-12 text-orange-600 dark:text-orange-400" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {passed ? '合格です！' : 'もう少し！'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {score}点（{correctCount}/{quiz.questions.length}問正解）
            </p>
          </div>

          {/* 詳細結果 */}
          <div className="space-y-4 mb-8">
            {quiz.questions.map((q, index) => {
              const userAnswer = answers[index]
              const isCorrect = userAnswer === q.correct_answer

              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
                    isCorrect
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white mb-2">
                        Q{index + 1}. {q.question}
                      </p>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-600 dark:text-gray-400">
                          あなたの回答: <span className={isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {q.options[userAnswer]}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-gray-600 dark:text-gray-400">
                            正解: <span className="text-green-600 dark:text-green-400">
                              {q.options[q.correct_answer]}
                            </span>
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-gray-700 dark:text-gray-300 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              もう一度挑戦
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              ライブラリに戻る
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 進捗バー */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            問題 {currentQuestion + 1} / {quiz.questions.length}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-purple-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* 問題カード */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {question.question}
          </h3>

          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  selectedAnswer === index
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === index
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedAnswer === index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-gray-900 dark:text-white">{option}</span>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className={`w-full px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              selectedAnswer === null
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isLastQuestion ? '結果を見る' : '次へ'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

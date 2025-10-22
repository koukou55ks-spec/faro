'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Sparkles, ArrowRight, CheckCircle2, Play } from 'lucide-react'
import { MarkdownRenderer } from './MarkdownRenderer'
import { motion, AnimatePresence } from 'framer-motion'

interface GuideChatProps {
  moduleId: string
  moduleTitle: string
  onBack: () => void
}

// ガイドレッスンのステップ定義
interface GuideStep {
  id: string
  content: string
  type: 'message' | 'interactive'
  nextButtonText?: string
}

// モジュールIDごとのレッスンコンテンツ
const GUIDE_LESSONS: Record<string, GuideStep[]> = {
  // ふるさと納税 - なぜ2000円で返礼品がもらえるの？
  f2: [
    {
      id: 'f2-intro',
      content: `こんにちは！「ふるさと納税」プレイリストから来ましたね！

3分で**「なぜ損しないか」**だけ説明します。

準備はいいですか？`,
      type: 'message',
      nextButtonText: '準備OK！'
    },
    {
      id: 'f2-step1',
      content: `## ステップ1：これは「前払い」です

ふるさと納税は、**来年の税金を前払いするだけ**です。

つまり：
- 今年3万円寄付したら
- 来年の税金が2万8千円減る
- 実質負担は**2000円だけ**

お金が増えるわけではなく、**税金の一部を好きな自治体に回せる**制度です。`,
      type: 'message',
      nextButtonText: '次へ'
    },
    {
      id: 'f2-step2',
      content: `## ステップ2：返礼品のカラクリ

なぜ2000円で返礼品がもらえるのか？

各自治体は、あなたの寄付金の**最大30%**を返礼品に使えます。

例：
- あなたが3万円寄付
- 自治体は9000円分の返礼品を送れる
- あなたの実質負担は2000円

だから**2000円で9000円分の返礼品**がもらえるんです！`,
      type: 'message',
      nextButtonText: '次へ'
    },
    {
      id: 'f2-step3',
      content: `## ステップ3：上限額に注意

重要なポイント：**寄付できる上限額**があります。

上限を超えると、超えた分は本当の寄付になります（税金が減りません）。

上限額は：
- 年収
- 家族構成
- 他の控除

で決まります。

次は「シミュレーター」で、あなたの上限額を計算しましょう！`,
      type: 'message',
      nextButtonText: '理解した！'
    },
    {
      id: 'f2-complete',
      content: `## 🎉 完了！

ふるさと納税の仕組みが理解できましたね！

### まとめ
✅ 来年の税金の前払い
✅ 実質負担2000円で返礼品
✅ 上限額を守れば損しない

次のモジュール「シミュレーター」で、あなたの上限額を確認しましょう！`,
      type: 'message',
      nextButtonText: 'プレイリストに戻る'
    }
  ],

  // 103万・130万の壁 - なぜ手取りが減る谷が生まれるのか
  w2: [
    {
      id: 'w2-intro',
      content: `「103万・130万の壁」プレイリストにようこそ！

この5分間で、**なぜ手取りが減る「谷」が生まれるのか**を完全に理解できます。

準備はいいですか？`,
      type: 'message',
      nextButtonText: '準備OK！'
    },
    {
      id: 'w2-step1',
      content: `## ステップ1：103万円の壁とは？

103万円を超えると、**あなた自身に所得税**がかかり始めます。

さらに重要なのは：
- **配偶者（夫・妻）の税金が増える**
- 配偶者控除（38万円）が減り始める

例：
- 年収102万円 → 配偶者の税金：0円増
- 年収104万円 → 配偶者の税金：約5万円増

つまり、2万円多く働いて5万円損する「谷」が生まれます。`,
      type: 'message',
      nextButtonText: '次へ'
    },
    {
      id: 'w2-step2',
      content: `## ステップ2：130万円の壁とは？

130万円を超えると、**社会保険に加入義務**が発生します。

具体的には：
- 健康保険料：約8万円/年
- 厚生年金保険料：約14万円/年
- 合計：約22万円/年

例：
- 年収129万円 → 社会保険料：0円
- 年収131万円 → 社会保険料：約22万円

2万円多く働いて22万円負担が増える、**最も深い谷**です。`,
      type: 'message',
      nextButtonText: '次へ'
    },
    {
      id: 'w2-step3',
      content: `## ステップ3：どうすればいい？

### 戦略は3つ：

**1. 103万円以内に抑える**
- 配偶者控除をフル活用
- 最も節税効果が高い

**2. 150万円を超えるまで働く**
- 谷を飛び越える
- 手取りで逆転できる

**3. 社会保険込みで考える**
- 将来の年金も増える
- 長期的にはプラス

次のモジュール「シミュレーター」で、実際の数字を体験してみましょう！`,
      type: 'message',
      nextButtonText: '理解した！'
    },
    {
      id: 'w2-complete',
      content: `## 🎉 完了！

「手取りが減る谷」の仕組みが完全に理解できましたね！

### まとめ
✅ 103万円の壁 = 配偶者控除の境界
✅ 130万円の壁 = 社会保険加入の境界
✅ 谷を避ける or 飛び越える戦略

次は「シミュレーター」で、あなたの手取りの変化を視覚化しましょう！`,
      type: 'message',
      nextButtonText: 'プレイリストに戻る'
    }
  ],

  // 確定申告 - 確定申告って何するの？
  k1: [
    {
      id: 'k1-intro',
      content: `「確定申告はじめてガイド」プレイリストにようこそ！

確定申告は難しくありません。**ただの報告**です。

3分で全体像を掴みましょう！`,
      type: 'message',
      nextButtonText: '始める'
    },
    {
      id: 'k1-step1',
      content: `## ステップ1：確定申告は「報告書」

確定申告とは：
**去年稼いだお金と使った経費を国に報告すること**

それだけです。

サラリーマンは会社が代わりにやってくれます（年末調整）。
でも、フリーランス・副業の人は自分で報告する必要があります。`,
      type: 'message',
      nextButtonText: '次へ'
    },
    {
      id: 'k1-step2',
      content: `## ステップ2：何を報告するの？

報告する内容は3つだけ：

### 1. 収入（稼いだお金）
- 売上、報酬、給料など

### 2. 経費（仕事で使ったお金）
- 交通費、備品、通信費など

### 3. 控除（税金が減る項目）
- 保険料、ふるさと納税など

この3つを書類にまとめて提出するだけです。`,
      type: 'message',
      nextButtonText: '次へ'
    },
    {
      id: 'k1-step3',
      content: `## ステップ3：いつやるの？

確定申告の期間：
**毎年2月16日〜3月15日**

この1ヶ月間に、去年の分を報告します。

### 準備は今からできる！
- レシートを保管
- 売上を記録
- 経費を整理

Faroがサポートします！

次は「青色申告 vs 白色申告」のクイズで、あなたに合う方法を見つけましょう。`,
      type: 'message',
      nextButtonText: '理解した！'
    },
    {
      id: 'k1-complete',
      content: `## 🎉 完了！

確定申告の全体像が理解できましたね！

### まとめ
✅ 確定申告 = 収入・経費・控除の報告
✅ 期間は毎年2月16日〜3月15日
✅ 準備は今からできる

次は「クイズ」で、白色 or 青色どちらが適しているか診断しましょう！`,
      type: 'message',
      nextButtonText: 'プレイリストに戻る'
    }
  ],

  // 医療費控除 - 10万円のカラクリ
  m2: [
    {
      id: 'm2-intro',
      content: `「医療費控除の全て」プレイリストにようこそ！

「医療費10万円超えたら控除」って聞いたことありますよね？

実は、**10万円以下でも使える**場合があります。

4分で完全理解しましょう！`,
      type: 'message',
      nextButtonText: '始める'
    },
    {
      id: 'm2-step1',
      content: `## ステップ1：10万円のカラクリ

正確なルール：
**医療費が「10万円」または「所得の5%」の高い方を超えたら控除できる**

例1：年収500万円の人
- 所得の5% = 約12.5万円
- 基準：12.5万円（10万円より高い）

例2：年収200万円の人
- 所得の5% = 約5万円
- 基準：10万円（5万円より高い）

つまり、**年収が低い人は10万円以下でも控除できます**！`,
      type: 'message',
      nextButtonText: '次へ'
    },
    {
      id: 'm2-step2',
      content: `## ステップ2：何が医療費に含まれる？

### ✅ 控除対象
- 病院の診察・治療費
- 処方された薬代
- 通院の交通費
- 入院費
- 歯の治療（保険適用外も一部OK）

### ❌ 対象外
- 美容目的の整形
- 健康診断（異常なしの場合）
- サプリメント
- 予防接種

家族全員の医療費を合算できます！`,
      type: 'message',
      nextButtonText: '次へ'
    },
    {
      id: 'm2-step3',
      content: `## ステップ3：セルフメディケーション税制

「医療費10万円も使ってない...」という人に朗報！

### セルフメディケーション税制
- 対象の市販薬を**1万2千円以上**購入
- 最大8万8千円まで控除

どっちか選べます（併用不可）：
- **医療費控除**（10万円超の医療費）
- **セルフメディケーション税制**（1.2万円超の市販薬）

次のモジュール「シミュレーター」で、還付金を計算してみましょう！`,
      type: 'message',
      nextButtonText: '理解した！'
    },
    {
      id: 'm2-complete',
      content: `## 🎉 完了！

医療費控除の仕組みが完全に理解できましたね！

### まとめ
✅ 基準は「10万円」または「所得の5%」
✅ 家族全員の医療費を合算できる
✅ 市販薬の控除制度もある

次は「シミュレーター」で、あなたの還付金を計算しましょう！`,
      type: 'message',
      nextButtonText: 'プレイリストに戻る'
    }
  ],

  // NISA - NISAって何？
  n1: [
    {
      id: 'n1-intro',
      content: `「NISA完全ガイド」プレイリストにようこそ！

NISAは**1800万円の非課税枠**を持つ最強の投資制度です。

5分で完全理解しましょう！`,
      type: 'message',
      nextButtonText: '始める'
    },
    {
      id: 'n1-step1',
      content: `## ステップ1：NISAとは？

NISA = **投資の利益にかかる税金がゼロになる制度**

通常：
- 株で100万円利益 → 税金20万円（20%）
- 手取り80万円

NISA：
- 株で100万円利益 → 税金0円
- 手取り100万円

**20万円も得します**！`,
      type: 'message',
      nextButtonText: '次へ'
    },
    {
      id: 'n1-step2',
      content: `## ステップ2：新NISAの威力

2024年から**新NISA**がスタート：

### 生涯投資枠：1800万円
- 成長投資枠：1200万円（個別株など）
- つみたて投資枠：1800万円（投資信託）

### 年間投資枠：360万円
- 成長投資枠：240万円/年
- つみたて投資枠：120万円/年

### 非課税期間：無期限
- 旧NISAは5年 or 20年だった
- 新NISAは**永遠に非課税**！`,
      type: 'message',
      nextButtonText: '次へ'
    },
    {
      id: 'n1-step3',
      content: `## ステップ3：どれだけお得？

### 例：30年間、毎月3万円投資
- 元本：1080万円
- 運用益（年利5%）：約1400万円
- 合計：約2480万円

**税金（通常）：280万円**
**税金（NISA）：0円**

### 280万円の差！

これが、NISAを使わない理由がない理由です。

次のモジュール「クイズ」で、新NISA vs 旧NISAの違いを確認しましょう！`,
      type: 'message',
      nextButtonText: '理解した！'
    },
    {
      id: 'n1-complete',
      content: `## 🎉 完了！

NISAの威力が完全に理解できましたね！

### まとめ
✅ 投資の利益が非課税（最大280万円以上お得）
✅ 新NISAは1800万円の生涯投資枠
✅ 非課税期間は無期限

次は「クイズ」で新NISA vs 旧NISAの違いをマスターしましょう！`,
      type: 'message',
      nextButtonText: 'プレイリストに戻る'
    }
  ],
}

export function GuideChat({ moduleId, moduleTitle, onBack }: GuideChatProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const lesson = GUIDE_LESSONS[moduleId] || []
  const currentStep = lesson[currentStepIndex]
  const progress = ((currentStepIndex + 1) / lesson.length) * 100
  const isLastStep = currentStepIndex === lesson.length - 1

  useEffect(() => {
    // Simulate typing animation when step changes
    setIsTyping(true)
    const timer = setTimeout(() => {
      setIsTyping(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [currentStepIndex])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentStepIndex])

  const handleNext = () => {
    if (isLastStep) {
      onBack()
    } else {
      setCurrentStepIndex(prev => Math.min(prev + 1, lesson.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStepIndex(prev => Math.max(prev - 1, 0))
  }

  if (lesson.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            このガイドは準備中です
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

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
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                AIガイド
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
            {moduleTitle}
          </h1>

          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>ステップ {currentStepIndex + 1}/{lesson.length}</span>
            <span>{Math.round(progress)}% 完了</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              {/* Faro Avatar + Message */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-white dark:bg-gray-800 rounded-3xl rounded-tl-md px-5 py-4 sm:px-6 sm:py-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    {isTyping ? (
                      <div className="flex gap-2 py-2">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </div>
                    ) : (
                      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-p:my-2 prose-p:leading-[1.7] prose-headings:mb-3 prose-headings:mt-4 prose-ul:my-3 prose-li:my-1.5 prose-strong:text-purple-600 dark:prose-strong:text-purple-400">
                        <MarkdownRenderer content={currentStep?.content || ''} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              前へ
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="flex-1 max-w-sm px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <span>{currentStep?.nextButtonText || (isLastStep ? '完了' : '次へ')}</span>
              {isLastStep ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Typing Animation Styles */}
      <style jsx>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          background-color: #9333ea;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

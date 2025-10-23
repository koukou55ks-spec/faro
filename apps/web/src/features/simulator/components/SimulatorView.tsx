'use client'

import { useState } from 'react'
import { ArrowLeft, TrendingUp, DollarSign, PieChart, Calculator } from 'lucide-react'
import { motion } from 'framer-motion'

interface SimulatorViewProps {
  moduleId: string
  moduleTitle: string
  onBack: () => void
}

// ふるさと納税限度額計算
function FurusatoNozeiSimulator() {
  const [income, setIncome] = useState(5000000)
  const [dependents, setDependents] = useState(0)
  const [insurancePremium, setInsurancePremium] = useState(0)

  // 簡易計算式（実際はもっと複雑）
  const calculateLimit = () => {
    const basicDeduction = 430000
    const dependentDeduction = dependents * 380000
    const totalDeduction = basicDeduction + dependentDeduction + insurancePremium
    const taxableIncome = Math.max(0, income - totalDeduction)

    // 住民税所得割の20% + 2000円（簡易版）
    const residentTaxRate = 0.1
    const residentTax = taxableIncome * residentTaxRate
    const limit = Math.floor((residentTax * 0.2 + 2000) / 100) * 100

    return Math.max(0, limit)
  }

  const limit = calculateLimit()
  const giftValue = Math.floor(limit * 0.3)

  return (
    <div className="space-y-6">
      {/* 説明 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          あなたの限度額を計算
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          年収や家族構成から、損しないふるさと納税の上限額を計算します。
        </p>
      </div>

      {/* 入力エリア */}
      <div className="space-y-4">
        {/* 年収 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            年収（万円）
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="2000000"
              max="20000000"
              step="100000"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
            />
            <div className="min-w-[120px] text-right">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {(income / 10000).toFixed(0)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">万円</span>
            </div>
          </div>
        </div>

        {/* 扶養家族 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            扶養家族
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={dependents}
              onChange={(e) => setDependents(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-600"
            />
            <div className="min-w-[120px] text-right">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {dependents}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">人</span>
            </div>
          </div>
        </div>

        {/* 保険料控除 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            保険料控除（万円）
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="200000"
              step="10000"
              value={insurancePremium}
              onChange={(e) => setInsurancePremium(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-600"
            />
            <div className="min-w-[120px] text-right">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {(insurancePremium / 10000).toFixed(0)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">万円</span>
            </div>
          </div>
        </div>
      </div>

      {/* 結果表示 */}
      <motion.div
        key={limit}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl"
      >
        <div className="text-center space-y-4">
          <p className="text-sm font-medium opacity-90">あなたの限度額</p>
          <div className="space-y-2">
            <p className="text-5xl font-bold">
              {limit.toLocaleString()}
              <span className="text-2xl ml-2">円</span>
            </p>
            <p className="text-sm opacity-80">
              実質負担2,000円で、約{giftValue.toLocaleString()}円分の返礼品
            </p>
          </div>

          <div className="pt-4 border-t border-white/20 text-sm space-y-2">
            <p className="opacity-90">💡 この金額までなら、実質2,000円の負担で済みます</p>
            <p className="opacity-90">⚠️ 超えた分は本当の寄付になるので注意！</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// 103万・130万の壁シミュレーター
function WageBarrierSimulator() {
  const [wage, setWage] = useState(1200000)

  const calculateTakeHome = (annualWage: number) => {
    let takeHome = annualWage
    let incomeTax = 0
    let residentTax = 0
    let socialInsurance = 0
    let spouseTax = 0

    // 本人の所得税（103万円超）
    if (annualWage > 1030000) {
      const taxableIncome = annualWage - 1030000
      incomeTax = taxableIncome * 0.05
    }

    // 本人の住民税（100万円超、簡易計算）
    if (annualWage > 1000000) {
      residentTax = (annualWage - 1000000) * 0.1
    }

    // 社会保険（130万円超）
    if (annualWage > 1300000) {
      socialInsurance = annualWage * 0.15 // 健保+厚生年金の概算
    }

    // 配偶者の税金増加（103万円超）
    if (annualWage > 1030000 && annualWage < 2015999) {
      const excessAmount = annualWage - 1030000
      // 配偶者特別控除の逓減（簡易計算）
      spouseTax = Math.min(excessAmount * 0.05, 50000)
    }

    takeHome = annualWage - incomeTax - residentTax - socialInsurance - spouseTax

    return {
      takeHome: Math.floor(takeHome),
      incomeTax: Math.floor(incomeTax),
      residentTax: Math.floor(residentTax),
      socialInsurance: Math.floor(socialInsurance),
      spouseTax: Math.floor(spouseTax),
      totalDeduction: Math.floor(incomeTax + residentTax + socialInsurance + spouseTax)
    }
  }

  const result = calculateTakeHome(wage)
  const is103Wall = wage > 1030000 && wage <= 1500000
  const is130Wall = wage > 1300000 && wage <= 1600000

  return (
    <div className="space-y-6">
      {/* 説明 */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          手取りが減る「谷」を体験
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          年収を変化させて、103万・130万の壁で手取りがどう変わるか確認しましょう。
        </p>
      </div>

      {/* スライダー */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          年収
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="800000"
            max="1800000"
            step="10000"
            value={wage}
            onChange={(e) => setWage(Number(e.target.value))}
            className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-orange-600"
          />
          <div className="min-w-[120px] text-right">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {(wage / 10000).toFixed(0)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">万円</span>
          </div>
        </div>
      </div>

      {/* 壁の警告 */}
      {is103Wall && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4"
        >
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            ⚠️ 103万円の壁エリア：配偶者の税金が増えています
          </p>
        </motion.div>
      )}

      {is130Wall && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl p-4"
        >
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            🚨 130万円の壁エリア：社会保険料が発生しています！
          </p>
        </motion.div>
      )}

      {/* 結果表示 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 手取り */}
        <motion.div
          key={result.takeHome}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl"
        >
          <p className="text-sm font-medium opacity-90 mb-2">手取り額</p>
          <p className="text-3xl font-bold">
            {result.takeHome.toLocaleString()}
            <span className="text-lg ml-1">円</span>
          </p>
        </motion.div>

        {/* 控除合計 */}
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-6 text-white shadow-xl">
          <p className="text-sm font-medium opacity-90 mb-2">控除合計</p>
          <p className="text-3xl font-bold">
            {result.totalDeduction.toLocaleString()}
            <span className="text-lg ml-1">円</span>
          </p>
        </div>
      </div>

      {/* 詳細内訳 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">控除の内訳</h4>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">あなたの所得税</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {result.incomeTax.toLocaleString()}円
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">あなたの住民税</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {result.residentTax.toLocaleString()}円
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">社会保険料</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {result.socialInsurance.toLocaleString()}円
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">配偶者の税金増加</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {result.spouseTax.toLocaleString()}円
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// NISA 30年投資シミュレーター
function InvestmentSimulator() {
  const [monthlyAmount, setMonthlyAmount] = useState(30000)
  const [years, setYears] = useState(30)
  const [returnRate, setReturnRate] = useState(5)

  const calculateInvestment = () => {
    const months = years * 12
    const monthlyRate = returnRate / 100 / 12

    // 元本
    const principal = monthlyAmount * months

    // 複利計算
    let futureValue = 0
    for (let i = 0; i < months; i++) {
      futureValue = (futureValue + monthlyAmount) * (1 + monthlyRate)
    }

    const profit = futureValue - principal

    // 税金計算（NISAなら0、普通なら20.315%）
    const taxNormal = profit * 0.20315
    const taxNISA = 0

    return {
      principal: Math.floor(principal),
      futureValue: Math.floor(futureValue),
      profit: Math.floor(profit),
      taxNormal: Math.floor(taxNormal),
      taxNISA: Math.floor(taxNISA),
      afterTaxNormal: Math.floor(futureValue - taxNormal),
      afterTaxNISA: Math.floor(futureValue - taxNISA),
      difference: Math.floor(taxNormal)
    }
  }

  const result = calculateInvestment()

  return (
    <div className="space-y-6">
      {/* 説明 */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          NISAの威力を実感
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          長期投資でNISAがどれだけお得か、実際の数字で確認しましょう。
        </p>
      </div>

      {/* 入力エリア */}
      <div className="space-y-4">
        {/* 毎月の投資額 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            毎月の投資額
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="10000"
              max="100000"
              step="5000"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-600"
            />
            <div className="min-w-[120px] text-right">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {(monthlyAmount / 10000).toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">万円</span>
            </div>
          </div>
        </div>

        {/* 投資期間 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            投資期間
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
            />
            <div className="min-w-[120px] text-right">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {years}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">年</span>
            </div>
          </div>
        </div>

        {/* 年利 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            想定年利
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={returnRate}
              onChange={(e) => setReturnRate(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-600"
            />
            <div className="min-w-[120px] text-right">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {returnRate.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 比較結果 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 普通の口座 */}
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5" />
            <p className="text-sm font-medium opacity-90">普通の口座</p>
          </div>
          <p className="text-3xl font-bold mb-2">
            {result.afterTaxNormal.toLocaleString()}
            <span className="text-lg ml-1">円</span>
          </p>
          <p className="text-xs opacity-70">税金: {result.taxNormal.toLocaleString()}円</p>
        </div>

        {/* NISA */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl border-2 border-yellow-400">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            <p className="text-sm font-medium opacity-90">NISA</p>
          </div>
          <p className="text-3xl font-bold mb-2">
            {result.afterTaxNISA.toLocaleString()}
            <span className="text-lg ml-1">円</span>
          </p>
          <p className="text-xs opacity-70">税金: 0円 🎉</p>
        </div>
      </div>

      {/* 差額の強調 */}
      <motion.div
        key={result.difference}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-center shadow-2xl"
      >
        <p className="text-sm font-medium text-gray-900 mb-2">💰 NISAで節税できる金額</p>
        <p className="text-5xl font-bold text-gray-900">
          {result.difference.toLocaleString()}
          <span className="text-2xl ml-2">円</span>
        </p>
      </motion.div>

      {/* 詳細 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">元本（積立額）</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {result.principal.toLocaleString()}円
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">運用益</span>
          <span className="font-medium text-green-600 dark:text-green-400">
            +{result.profit.toLocaleString()}円
          </span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">最終資産</span>
          <span className="font-bold text-gray-900 dark:text-white text-base">
            {result.futureValue.toLocaleString()}円
          </span>
        </div>
      </div>
    </div>
  )
}

export function SimulatorView({ moduleId, moduleTitle, onBack }: SimulatorViewProps) {
  const renderSimulator = () => {
    switch (moduleId) {
      case 'sim-furusato-nozei': // ふるさと納税限度額
      case 'f3': // 後方互換性
        return <FurusatoNozeiSimulator />
      case 'sim-wall-103-130': // 103万・130万の壁
      case 'w1': // 後方互換性
      case 'w3': // 後方互換性
        return <WageBarrierSimulator />
      case 'sim-nisa-investment': // NISA投資シミュレーター
      case 'n2': // 後方互換性
      case 'n3': // 後方互換性
        return <InvestmentSimulator />
      case 'sim-medical-deduction': // 医療費控除
      case 'm3': // 後方互換性
        return <div className="text-center py-12 text-gray-600 dark:text-gray-400">医療費控除シミュレーター（準備中）</div>
      case 'sim-housing-loan': // 住宅ローン控除
        return <div className="text-center py-12 text-gray-600 dark:text-gray-400">住宅ローン控除シミュレーター（準備中）</div>
      case 'sim-ideco-tax-benefit': // iDeCo節税効果
        return <div className="text-center py-12 text-gray-600 dark:text-gray-400">iDeCo節税効果シミュレーター（準備中）</div>
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              このシミュレーターは準備中です
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
            >
              戻る
            </button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">戻る</span>
            </button>
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                シミュレーター
              </span>
            </div>
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
            {moduleTitle}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {renderSimulator()}
      </div>
    </div>
  )
}

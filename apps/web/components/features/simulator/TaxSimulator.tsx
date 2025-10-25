'use client'

import { useState } from 'react'
import { Calculator, Info, TrendingDown, Users, Home, Heart, DollarSign, PiggyBank } from 'lucide-react'
import { motion } from 'framer-motion'

interface TaxSimulatorProps {
  onComplete?: (results: SimulationResult) => void
}

interface SimulationInput {
  annual_income: number
  employment_income_deduction: number
  social_insurance: number
  life_insurance: number
  earthquake_insurance: number
  medical_expenses: number
  donation: number
  spouse: boolean
  dependents: number
  spouse_income: number
}

interface SimulationResult {
  annual_income: number
  taxable_income: number
  income_tax: number
  resident_tax: number
  total_tax: number
  total_deductions: number
  effective_tax_rate: number
  savings_suggestions: Array<{
    type: string
    title: string
    potential_savings: number
    description: string
  }>
}

export function TaxSimulator({ onComplete }: TaxSimulatorProps) {
  const [step, setStep] = useState<'input' | 'result'>('input')
  const [input, setInput] = useState<SimulationInput>({
    annual_income: 5000000,
    employment_income_deduction: 0,
    social_insurance: 0,
    life_insurance: 0,
    earthquake_insurance: 0,
    medical_expenses: 0,
    donation: 0,
    spouse: false,
    dependents: 0,
    spouse_income: 0
  })
  const [result, setResult] = useState<SimulationResult | null>(null)

  // 給与所得控除の計算
  const calculateEmploymentIncomeDeduction = (income: number): number => {
    if (income <= 1625000) return 550000
    if (income <= 1800000) return income * 0.4 - 100000
    if (income <= 3600000) return income * 0.3 + 80000
    if (income <= 6600000) return income * 0.2 + 440000
    if (income <= 8500000) return income * 0.1 + 1100000
    return 1950000
  }

  // 基礎控除の計算
  const calculateBasicDeduction = (income: number): number => {
    if (income <= 24000000) return 480000
    if (income <= 24500000) return 320000
    if (income <= 25000000) return 160000
    return 0
  }

  // 配偶者控除の計算
  const calculateSpouseDeduction = (hasSpouse: boolean, spouseIncome: number, income: number): number => {
    if (!hasSpouse || spouseIncome > 1330000) return 0

    if (spouseIncome <= 950000) {
      // 配偶者控除
      if (income <= 9000000) return 380000
      if (income <= 9500000) return 260000
      if (income <= 10000000) return 130000
      return 0
    } else {
      // 配偶者特別控除
      if (income > 10000000) return 0
      const deductionBase = Math.max(0, 380000 - Math.floor((spouseIncome - 950000) / 50000) * 30000)
      if (income <= 9000000) return deductionBase
      if (income <= 9500000) return Math.floor(deductionBase * 2 / 3)
      return Math.floor(deductionBase / 3)
    }
  }

  // 扶養控除の計算
  const calculateDependentDeduction = (dependents: number): number => {
    return dependents * 380000
  }

  // 医療費控除の計算
  const calculateMedicalDeduction = (medicalExpenses: number, income: number): number => {
    const threshold = Math.min(income * 0.05, 100000)
    return Math.max(0, medicalExpenses - threshold)
  }

  // 生命保険料控除の計算
  const calculateLifeInsuranceDeduction = (premium: number): number => {
    if (premium <= 20000) return premium
    if (premium <= 40000) return premium * 0.5 + 10000
    if (premium <= 80000) return premium * 0.25 + 20000
    return 40000
  }

  // 地震保険料控除の計算
  const calculateEarthquakeInsuranceDeduction = (premium: number): number => {
    return Math.min(premium, 50000)
  }

  // 寄付金控除の計算（ふるさと納税）
  const calculateDonationDeduction = (donation: number): number => {
    return Math.max(0, donation - 2000)
  }

  // 所得税の計算（累進課税）
  const calculateIncomeTax = (taxableIncome: number): number => {
    if (taxableIncome <= 1950000) return taxableIncome * 0.05
    if (taxableIncome <= 3300000) return taxableIncome * 0.1 - 97500
    if (taxableIncome <= 6950000) return taxableIncome * 0.2 - 427500
    if (taxableIncome <= 9000000) return taxableIncome * 0.23 - 636000
    if (taxableIncome <= 18000000) return taxableIncome * 0.33 - 1536000
    if (taxableIncome <= 40000000) return taxableIncome * 0.4 - 2796000
    return taxableIncome * 0.45 - 4796000
  }

  // 住民税の計算（所得割10% + 均等割5000円）
  const calculateResidentTax = (taxableIncome: number): number => {
    // 住民税の所得控除は所得税と若干異なるが、簡略化のため同じ課税所得を使用
    return Math.floor(taxableIncome * 0.1) + 5000
  }

  // シミュレーション実行
  const runSimulation = () => {
    // 給与所得控除
    const employmentDeduction = input.employment_income_deduction || calculateEmploymentIncomeDeduction(input.annual_income)

    // 各種所得控除
    const basicDeduction = calculateBasicDeduction(input.annual_income)
    const socialInsuranceDeduction = input.social_insurance
    const lifeInsuranceDeduction = calculateLifeInsuranceDeduction(input.life_insurance)
    const earthquakeInsuranceDeduction = calculateEarthquakeInsuranceDeduction(input.earthquake_insurance)
    const medicalDeduction = calculateMedicalDeduction(input.medical_expenses, input.annual_income)
    const donationDeduction = calculateDonationDeduction(input.donation)
    const spouseDeduction = calculateSpouseDeduction(input.spouse, input.spouse_income, input.annual_income)
    const dependentDeduction = calculateDependentDeduction(input.dependents)

    const totalDeductions = employmentDeduction + basicDeduction + socialInsuranceDeduction +
                           lifeInsuranceDeduction + earthquakeInsuranceDeduction + medicalDeduction +
                           donationDeduction + spouseDeduction + dependentDeduction

    const taxableIncome = Math.max(0, input.annual_income - totalDeductions)
    const incomeTax = calculateIncomeTax(taxableIncome)
    const residentTax = calculateResidentTax(taxableIncome)
    const totalTax = incomeTax + residentTax
    const effectiveTaxRate = input.annual_income > 0 ? (totalTax / input.annual_income) * 100 : 0

    // 節税提案の生成
    const suggestions: SimulationResult['savings_suggestions'] = []

    // iDeCo提案
    if (input.annual_income >= 3000000) {
      const idecoMax = 276000 // 会社員の場合（年額）
      const potentialSavings = idecoMax * (effectiveTaxRate / 100)
      suggestions.push({
        type: 'ideco',
        title: 'iDeCo（個人型確定拠出年金）',
        potential_savings: Math.floor(potentialSavings),
        description: `年間${idecoMax.toLocaleString()}円まで拠出可能。全額所得控除で約${Math.floor(potentialSavings).toLocaleString()}円の節税効果。`
      })
    }

    // ふるさと納税提案
    if (input.donation < totalTax * 0.2) {
      const furusatoLimit = Math.floor((totalTax * 0.2) / 0.9)
      const potentialSavings = Math.floor(furusatoLimit * 0.3) // 返礼品30%換算
      suggestions.push({
        type: 'furusato',
        title: 'ふるさと納税',
        potential_savings: potentialSavings,
        description: `目安上限額：約${furusatoLimit.toLocaleString()}円。返礼品で実質約${potentialSavings.toLocaleString()}円分お得。`
      })
    }

    // 医療費控除提案
    if (input.medical_expenses < 100000 && input.annual_income >= 5000000) {
      suggestions.push({
        type: 'medical',
        title: '医療費控除',
        potential_savings: Math.floor(100000 * (effectiveTaxRate / 100)),
        description: '年間医療費が10万円を超えた場合、超過分が控除対象。領収書を保管しましょう。'
      })
    }

    // 生命保険料控除提案
    if (input.life_insurance < 80000) {
      const additionalPremium = 80000 - input.life_insurance
      const additionalDeduction = calculateLifeInsuranceDeduction(80000) - lifeInsuranceDeduction
      const potentialSavings = Math.floor(additionalDeduction * (effectiveTaxRate / 100))
      suggestions.push({
        type: 'life_insurance',
        title: '生命保険料控除',
        potential_savings: potentialSavings,
        description: `年間8万円まで控除対象。あと${additionalPremium.toLocaleString()}円で最大控除。`
      })
    }

    const simulationResult: SimulationResult = {
      annual_income: input.annual_income,
      taxable_income: taxableIncome,
      income_tax: Math.floor(incomeTax),
      resident_tax: Math.floor(residentTax),
      total_tax: Math.floor(totalTax),
      total_deductions: Math.floor(totalDeductions),
      effective_tax_rate: Number(effectiveTaxRate.toFixed(2)),
      savings_suggestions: suggestions
    }

    setResult(simulationResult)
    setStep('result')
    onComplete?.(simulationResult)
  }

  const resetSimulation = () => {
    setStep('input')
    setResult(null)
  }

  if (step === 'result' && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 税金サマリー */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-purple-600" />
            シミュレーション結果
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">年収</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ¥{result.annual_income.toLocaleString()}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">課税所得</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ¥{result.taxable_income.toLocaleString()}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">所得税</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ¥{result.income_tax.toLocaleString()}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">住民税</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ¥{result.resident_tax.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">年間税額合計</span>
              <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                ¥{result.total_tax.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">実効税率</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {result.effective_tax_rate}%
              </span>
            </div>
          </div>
        </div>

        {/* 控除内訳 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-green-600" />
            控除合計：¥{result.total_deductions.toLocaleString()}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            各種控除により、年収から{result.total_deductions.toLocaleString()}円が差し引かれています。
          </p>
        </div>

        {/* 節税提案 */}
        {result.savings_suggestions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-green-600" />
              節税提案
            </h4>
            <div className="space-y-3">
              {result.savings_suggestions.map((suggestion, index) => (
                <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-gray-900 dark:text-white">{suggestion.title}</h5>
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      最大 ¥{suggestion.potential_savings.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-3">
          <button
            onClick={resetSimulation}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-colors"
          >
            条件を変更
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-1">税金シミュレーター</p>
            <p>年収や各種控除額を入力すると、所得税・住民税の概算を計算します。節税のヒントも提案します。</p>
          </div>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-600" />
          基本情報
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              年収（額面）
            </label>
            <input
              type="number"
              value={input.annual_income}
              onChange={(e) => setInput({ ...input, annual_income: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="5000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              社会保険料（年間）
            </label>
            <input
              type="number"
              value={input.social_insurance}
              onChange={(e) => setInput({ ...input, social_insurance: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="750000"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">健康保険・厚生年金など（源泉徴収票を確認）</p>
          </div>
        </div>
      </div>

      {/* 家族構成 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          家族構成
        </h4>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="spouse"
              checked={input.spouse}
              onChange={(e) => setInput({ ...input, spouse: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor="spouse" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              配偶者あり
            </label>
          </div>
          {input.spouse && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                配偶者の年収
              </label>
              <input
                type="number"
                value={input.spouse_income}
                onChange={(e) => setInput({ ...input, spouse_income: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">103万円以下で配偶者控除、133万円以下で配偶者特別控除</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              扶養親族の人数
            </label>
            <input
              type="number"
              value={input.dependents}
              onChange={(e) => setInput({ ...input, dependents: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* 各種控除 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-600" />
          各種控除
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              生命保険料（年間）
            </label>
            <input
              type="number"
              value={input.life_insurance}
              onChange={(e) => setInput({ ...input, life_insurance: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">最大8万円まで控除対象</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              地震保険料（年間）
            </label>
            <input
              type="number"
              value={input.earthquake_insurance}
              onChange={(e) => setInput({ ...input, earthquake_insurance: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">最大5万円まで控除対象</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              医療費（年間）
            </label>
            <input
              type="number"
              value={input.medical_expenses}
              onChange={(e) => setInput({ ...input, medical_expenses: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">10万円超で控除対象（所得5%との少ない方）</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ふるさと納税（年間）
            </label>
            <input
              type="number"
              value={input.donation}
              onChange={(e) => setInput({ ...input, donation: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">自己負担2,000円を除いた額が控除対象</p>
          </div>
        </div>
      </div>

      {/* 計算ボタン */}
      <button
        onClick={runSimulation}
        className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <Calculator className="w-6 h-6" />
        税金を計算する
      </button>
    </motion.div>
  )
}

// モジュール中心のデータ定義
// 1つのモジュール = 1曲（単独で完結するコンテンツ）

export type ModuleType = 'simulator' | 'guide' | 'scan' | 'quiz'

export interface ExperienceModule {
  id: string
  type: ModuleType
  title: string
  duration: string
  description: string
  coverColor: string
  plays?: number
  category: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  tags?: string[]
}

// 全モジュールデータ
export const allModules: ExperienceModule[] = [
  // === シミュレーター ===
  {
    id: 'sim-furusato-nozei',
    type: 'simulator',
    title: 'ふるさと納税 上限額シミュレーター',
    duration: '3分',
    description: 'あなたはいくらまで実質2000円で寄付できる？年収と家族構成を入力するだけ',
    coverColor: 'from-blue-500 to-blue-600',
    plays: 12453,
    category: 'tax',
    difficulty: 'beginner',
    tags: ['ふるさと納税', '控除', '節税']
  },
  {
    id: 'sim-wall-103-130',
    type: 'simulator',
    title: '103万・130万の壁 体験シミュレーター',
    duration: '5分',
    description: 'スライダーで年収を動かして「手取りが減る谷」を実際に体験',
    coverColor: 'from-purple-500 to-purple-600',
    plays: 9821,
    category: 'tax',
    difficulty: 'beginner',
    tags: ['扶養', '配偶者控除', '社会保険']
  },
  {
    id: 'sim-medical-deduction',
    type: 'simulator',
    title: '医療費控除シミュレーター',
    duration: '4分',
    description: '10万円超えたらいくら還付される？医療費を入力して即座に計算',
    coverColor: 'from-green-500 to-green-600',
    plays: 7102,
    category: 'tax',
    difficulty: 'beginner',
    tags: ['医療費控除', '確定申告', '還付金']
  },
  {
    id: 'sim-nisa-investment',
    type: 'simulator',
    title: 'NISA vs 普通口座 30年シミュレーター',
    duration: '10分',
    description: '30年後の資産を比較。NISAの節税効果を実感',
    coverColor: 'from-emerald-500 to-emerald-600',
    plays: 8543,
    category: 'investment',
    difficulty: 'intermediate',
    tags: ['NISA', '投資', '資産運用']
  },
  {
    id: 'sim-housing-loan',
    type: 'simulator',
    title: '住宅ローン控除シミュレーター',
    duration: '6分',
    description: '最大400万円の控除額を計算。借入額と年収を入力',
    coverColor: 'from-red-500 to-red-600',
    plays: 6543,
    category: 'tax',
    difficulty: 'intermediate',
    tags: ['住宅ローン', '控除', 'マイホーム']
  },
  {
    id: 'sim-ideco-tax-benefit',
    type: 'simulator',
    title: 'iDeCo 節税効果シミュレーター',
    duration: '5分',
    description: '年間いくら節税できる？掛金と年収から即座に計算',
    coverColor: 'from-blue-400 to-blue-500',
    plays: 5234,
    category: 'investment',
    difficulty: 'intermediate',
    tags: ['iDeCo', '年金', '節税']
  },

  // === AIガイドトーク ===
  {
    id: 'guide-furusato-why',
    type: 'guide',
    title: 'ふるさと納税の仕組み - なぜ2000円で返礼品？',
    duration: '5分',
    description: 'Faroが3往復の対話で仕組みを完全解説。税金の前払いって何？',
    coverColor: 'from-indigo-500 to-purple-600',
    plays: 8234,
    category: 'tax',
    difficulty: 'beginner',
    tags: ['ふるさと納税', '基礎知識']
  },
  {
    id: 'guide-wall-why',
    type: 'guide',
    title: 'なぜ「手取りが減る谷」が生まれるのか',
    duration: '5分',
    description: '103万と130万の違いをステップバイステップで説明',
    coverColor: 'from-pink-500 to-rose-600',
    plays: 6123,
    category: 'tax',
    difficulty: 'beginner',
    tags: ['扶養', '配偶者控除']
  },
  {
    id: 'guide-kakutei-shinkoku',
    type: 'guide',
    title: '確定申告って何するの？3分で全体像',
    duration: '3分',
    description: '難しくない、ただの報告です。Faroがやさしく教えます',
    coverColor: 'from-orange-500 to-red-600',
    plays: 7891,
    category: 'tax',
    difficulty: 'beginner',
    tags: ['確定申告', '基礎知識']
  },
  {
    id: 'guide-nisa-what',
    type: 'guide',
    title: 'NISAって何？5分で完全理解',
    duration: '5分',
    description: 'なぜ非課税？新NISAと旧NISAの違いは？',
    coverColor: 'from-teal-500 to-emerald-600',
    plays: 9234,
    category: 'investment',
    difficulty: 'beginner',
    tags: ['NISA', '投資', '非課税']
  },

  // === クイズ ===
  {
    id: 'quiz-deduction-basics',
    type: 'quiz',
    title: '「控除」って何？1分クイズ',
    duration: '1分',
    description: '税金用語を気軽にチェック。3問で理解度確認',
    coverColor: 'from-yellow-500 to-orange-500',
    plays: 11234,
    category: 'tax',
    difficulty: 'beginner',
    tags: ['クイズ', '控除', '基礎']
  },
  {
    id: 'quiz-wall-103-vs-130',
    type: 'quiz',
    title: '103万 vs 130万、どっちが「税金」の壁？',
    duration: '2分',
    description: 'まずはクイズで腕試し。即座にフィードバック',
    coverColor: 'from-purple-400 to-pink-500',
    plays: 8765,
    category: 'tax',
    difficulty: 'beginner',
    tags: ['クイズ', '扶養', '社会保険']
  },
  {
    id: 'quiz-white-vs-blue',
    type: 'quiz',
    title: '白色申告 vs 青色申告、あなたはどっち？',
    duration: '2分',
    description: '3つの質問で判定。フリーランス・個人事業主向け',
    coverColor: 'from-cyan-500 to-blue-600',
    plays: 6543,
    category: 'freelance',
    difficulty: 'intermediate',
    tags: ['クイズ', '確定申告', 'フリーランス']
  },
  {
    id: 'quiz-nisa-old-vs-new',
    type: 'quiz',
    title: '新NISA vs 旧NISA、どう違う？',
    duration: '3分',
    description: '制度改正のポイントを3問でチェック',
    coverColor: 'from-green-400 to-emerald-600',
    plays: 7891,
    category: 'investment',
    difficulty: 'intermediate',
    tags: ['クイズ', 'NISA', '投資']
  },
  {
    id: 'quiz-medical-celmedication',
    type: 'quiz',
    title: 'セルフメディケーション税制って何？',
    duration: '2分',
    description: '医療費控除の特例をクイズで学ぶ',
    coverColor: 'from-lime-500 to-green-600',
    plays: 4321,
    category: 'tax',
    difficulty: 'intermediate',
    tags: ['クイズ', '医療費控除', '薬']
  },

  // === スキャン（準備中） ===
  {
    id: 'scan-withholding',
    type: 'scan',
    title: '源泉徴収票スキャン - 正確な限度額計算',
    duration: '5分',
    description: '写真を撮るだけで自動計算。全シミュレーターが精密モードに',
    coverColor: 'from-orange-400 to-red-500',
    plays: 3456,
    category: 'tax',
    difficulty: 'beginner',
    tags: ['スキャン', '源泉徴収票', 'OCR']
  },
  {
    id: 'scan-receipt',
    type: 'scan',
    title: 'レシートスキャン - 経費自動分類',
    duration: '5分',
    description: 'AIが勘定科目を提案。フリーランス・個人事業主向け',
    coverColor: 'from-indigo-400 to-purple-500',
    plays: 2876,
    category: 'freelance',
    difficulty: 'intermediate',
    tags: ['スキャン', 'レシート', '経費']
  }
]

// カテゴリー別モジュール取得
export function getModulesByCategory(category: string): ExperienceModule[] {
  return allModules.filter(m => m.category === category)
}

// タイプ別モジュール取得
export function getModulesByType(type: ModuleType): ExperienceModule[] {
  return allModules.filter(m => m.type === type)
}

// 人気順（再生回数順）
export function getPopularModules(limit?: number): ExperienceModule[] {
  const sorted = [...allModules].sort((a, b) => (b.plays || 0) - (a.plays || 0))
  return limit ? sorted.slice(0, limit) : sorted
}

// ID検索
export function getModuleById(id: string): ExperienceModule | undefined {
  return allModules.find(m => m.id === id)
}

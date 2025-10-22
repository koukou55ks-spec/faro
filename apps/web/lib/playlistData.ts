// プレイリストとモジュールの完全なデータ定義

export type ModuleType = 'simulator' | 'guide' | 'scan' | 'quiz'

export interface Module {
  id: string
  type: ModuleType
  title: string
  duration: string
  description?: string
}

export interface Playlist {
  id: string
  title: string
  description: string
  duration: string
  modules: Module[]
  coverColor: string
  plays?: number
  category?: string
}

// 主要プレイリストの詳細モジュール定義
export const playlistsWithModules: Playlist[] = [
  // 1. ふるさと納税 完全攻略
  {
    id: '1',
    title: 'ふるさと納税 完全攻略',
    description: '損せず、迷わず、3ステップで完了',
    duration: '15分',
    coverColor: 'from-blue-500 to-blue-600',
    plays: 12453,
    category: 'ranking',
    modules: [
      {
        id: 'f1',
        type: 'quiz',
        title: '「控除」って何？まずは1分クイズ',
        duration: '1分',
        description: '税金用語を気軽にチェック'
      },
      {
        id: 'f2',
        type: 'guide',
        title: 'なぜ「2000円で返礼品」がもらえるの？',
        duration: '5分',
        description: 'Faroが3分で仕組みを解説'
      },
      {
        id: 'f3',
        type: 'simulator',
        title: 'あなたの上限額をシミュレート',
        duration: '3分',
        description: '年収と家族構成を入力するだけ'
      },
      {
        id: 'f4',
        type: 'scan',
        title: '源泉徴収票をスキャンして正確な上限額を計算',
        duration: '5分',
        description: '写真を撮るだけで自動計算'
      }
    ]
  },

  // 2. 103万・130万の壁
  {
    id: '2',
    title: '103万・130万の壁 完全理解',
    description: '手取りが減る谷を体験して理解する',
    duration: '12分',
    coverColor: 'from-purple-500 to-purple-600',
    plays: 9821,
    category: 'ranking',
    modules: [
      {
        id: 'w1',
        type: 'quiz',
        title: '103万 vs 130万、どっちが「税金」の壁？',
        duration: '2分',
        description: 'まずはクイズで腕試し'
      },
      {
        id: 'w2',
        type: 'guide',
        title: 'なぜ「手取りが減る谷」が生まれるのか',
        duration: '5分',
        description: 'Faroがステップバイステップで説明'
      },
      {
        id: 'w3',
        type: 'simulator',
        title: '「手取りが減る谷」をスライダーで体験',
        duration: '5分',
        description: '年収を動かして谷を確認'
      }
    ]
  },

  // 3. 確定申告はじめて
  {
    id: '3',
    title: '確定申告 はじめてガイド',
    description: 'フリーランス・副業の方へ',
    duration: '20分',
    coverColor: 'from-orange-500 to-orange-600',
    plays: 8234,
    category: 'ranking',
    modules: [
      {
        id: 'k1',
        type: 'guide',
        title: '確定申告って何するの？3分で全体像',
        duration: '3分',
        description: '難しくない、ただの報告です'
      },
      {
        id: 'k2',
        type: 'quiz',
        title: '「白色」と「青色」、あなたはどっち？',
        duration: '2分',
        description: '3つの質問で判定'
      },
      {
        id: 'k3',
        type: 'simulator',
        title: '経費を入力して税額をシミュレート',
        duration: '10分',
        description: '実際の数字で計算してみる'
      },
      {
        id: 'k4',
        type: 'scan',
        title: 'レシートスキャンで経費を自動分類',
        duration: '5分',
        description: 'AI が勘定科目を提案'
      }
    ]
  },

  // 4. 医療費控除の全て
  {
    id: '4',
    title: '医療費控除の全て',
    description: '10万円超えたら申請しよう',
    duration: '10分',
    coverColor: 'from-green-500 to-green-600',
    plays: 7102,
    category: 'ranking',
    modules: [
      {
        id: 'm1',
        type: 'quiz',
        title: 'セルフメディケーション税制って何？',
        duration: '2分'
      },
      {
        id: 'm2',
        type: 'guide',
        title: '10万円のカラクリ - 実は意外と簡単',
        duration: '4分'
      },
      {
        id: 'm3',
        type: 'simulator',
        title: '医療費を入力して還付金を計算',
        duration: '4分'
      }
    ]
  },

  // 5. NISA完全ガイド
  {
    id: '31',
    title: 'NISA完全ガイド',
    description: '1800万円非課税の威力',
    duration: '18分',
    coverColor: 'from-emerald-500 to-emerald-600',
    category: 'investment',
    modules: [
      {
        id: 'n1',
        type: 'guide',
        title: 'NISA って何？5分で完全理解',
        duration: '5分'
      },
      {
        id: 'n2',
        type: 'quiz',
        title: '新NISA vs 旧NISA、どう違う？',
        duration: '3分'
      },
      {
        id: 'n3',
        type: 'simulator',
        title: '30年後の資産をシミュレート',
        duration: '10分',
        description: '複利の威力を体験'
      }
    ]
  }
]

// すべてのプレイリスト（モジュールなしのものも含む）
export const allPlaylists: Playlist[] = [
  ...playlistsWithModules,

  // その他のプレイリスト（モジュールは空）
  { id: '5', title: '住宅ローン控除', description: '最大400万円', duration: '18分', coverColor: 'from-red-500 to-red-600', plays: 6543, category: 'ranking', modules: [] },
  { id: '11', title: '給与明細の読み方', description: '手取りの仕組み', duration: '8分', coverColor: 'from-cyan-500 to-cyan-600', category: 'salary', modules: [] },
  { id: '12', title: '年末調整 完璧ガイド', description: '11月までに準備', duration: '12分', coverColor: 'from-indigo-500 to-indigo-600', category: 'salary', modules: [] },
  { id: '13', title: '副業の確定申告', description: '20万円ルール', duration: '15分', coverColor: 'from-pink-500 to-pink-600', category: 'salary', modules: [] },
  { id: '14', title: '通勤手当と税金', description: '非課税の上限', duration: '6分', coverColor: 'from-teal-500 to-teal-600', category: 'salary', modules: [] },
  { id: '15', title: '退職金の税金', description: '控除を最大化', duration: '14分', coverColor: 'from-amber-500 to-amber-600', category: 'salary', modules: [] },
  { id: '21', title: '所得税の基本', description: '累進課税とは', duration: '10分', coverColor: 'from-violet-500 to-violet-600', category: 'income-tax', modules: [] },
  { id: '22', title: '10種類の所得', description: '給与・事業・雑所得', duration: '16分', coverColor: 'from-fuchsia-500 to-fuchsia-600', category: 'income-tax', modules: [] },
  { id: '23', title: '所得控除14種類', description: '税金を減らす', duration: '22分', coverColor: 'from-rose-500 to-rose-600', category: 'income-tax', modules: [] },
  { id: '24', title: '税率シミュレーター', description: '5%〜45%を体験', duration: '8分', coverColor: 'from-sky-500 to-sky-600', category: 'income-tax', modules: [] },
  { id: '25', title: '源泉徴収のカラクリ', description: '天引きの仕組み', duration: '12分', coverColor: 'from-lime-500 to-lime-600', category: 'income-tax', modules: [] },
  { id: '32', title: 'iDeCo節税効果', description: '年間27.6万円控除', duration: '14分', coverColor: 'from-blue-400 to-blue-500', category: 'investment', modules: [] },
  { id: '33', title: '株式投資と税金', description: '特定口座を理解', duration: '16分', coverColor: 'from-purple-400 to-purple-500', category: 'investment', modules: [] },
  { id: '34', title: '仮想通貨の確定申告', description: '雑所得の計算', duration: '20分', coverColor: 'from-orange-400 to-orange-500', category: 'investment', modules: [] },
  { id: '35', title: '不動産投資の税金', description: '減価償却を活用', duration: '24分', coverColor: 'from-red-400 to-red-500', category: 'investment', modules: [] },
  { id: '41', title: '青色申告65万円控除', description: '最強の節税', duration: '18分', coverColor: 'from-cyan-400 to-cyan-500', category: 'freelance', modules: [] },
  { id: '42', title: '経費の境界線', description: '何が認められる？', duration: '12分', coverColor: 'from-indigo-400 to-indigo-500', category: 'freelance', modules: [] },
  { id: '43', title: 'インボイス制度', description: '登録すべき？', duration: '16分', coverColor: 'from-pink-400 to-pink-500', category: 'freelance', modules: [] },
  { id: '44', title: '小規模企業共済', description: '退職金を作る', duration: '14分', coverColor: 'from-teal-400 to-teal-500', category: 'freelance', modules: [] },
  { id: '45', title: '帳簿のつけ方', description: 'freee vs 弥生', duration: '10分', coverColor: 'from-amber-400 to-amber-500', category: 'freelance', modules: [] },
  { id: '51', title: '配偶者控除・特別控除', description: '150万円の壁', duration: '14分', coverColor: 'from-violet-400 to-violet-500', category: 'family', modules: [] },
  { id: '52', title: '扶養控除を最大化', description: '16歳以上の子供', duration: '10分', coverColor: 'from-fuchsia-400 to-fuchsia-500', category: 'family', modules: [] },
  { id: '53', title: 'ひとり親控除', description: '35万円控除', duration: '8分', coverColor: 'from-rose-400 to-rose-500', category: 'family', modules: [] },
  { id: '54', title: '教育資金の贈与', description: '1500万円非課税', duration: '16分', coverColor: 'from-sky-400 to-sky-500', category: 'family', modules: [] },
  { id: '55', title: '相続税の基本', description: '3000万円+600万円×人数', duration: '20分', coverColor: 'from-lime-400 to-lime-500', category: 'family', modules: [] },
]

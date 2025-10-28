/**
 * システムタブ定義（設定ファイル）
 *
 * すべてのシステムタブのフィールド定義を一元管理
 */

import { SystemTabDefinition, FieldDefinition } from '../types/systemTab'

// ============================================================================
// バリデーション関数
// ============================================================================

const validateIncome = (value: number): string | null => {
  if (value < 0) return '年収は0以上で入力してください'
  if (value > 100000) return '年収が高すぎます。万円単位で入力してください'
  if (value > 0 && value < 50) return '年収が低すぎます。万円単位で入力してください（例: 500 = 500万円）'
  return null
}

const validatePositiveNumber = (value: number): string | null => {
  if (value < 0) return '0以上の値を入力してください'
  return null
}

// ============================================================================
// システムタブ1: 基本情報
// ============================================================================

const basicInfoFields: FieldDefinition[] = [
  {
    key: 'annual_income',
    label: '年収',
    type: 'number',
    required: true,
    unit: '万円',
    placeholder: '例: 500',
    min: 0,
    max: 100000,
    step: 10,
    helpText: '税込の年収を万円単位で入力してください（例: 500万円の場合は「500」）',
    importance: 'critical',
    validate: validateIncome,
  },
  {
    key: 'has_spouse',
    label: '配偶者',
    type: 'select',
    required: true,
    options: ['いない', 'いる（収入あり）', 'いる（収入なし）'],
    helpText: '配偶者の有無と収入状況を選択してください',
    importance: 'critical',
  },
  {
    key: 'dependents_count',
    label: '扶養家族の人数',
    type: 'number',
    required: true,
    unit: '人',
    placeholder: '0',
    min: 0,
    max: 20,
    step: 1,
    helpText: '扶養している家族の人数を入力してください（配偶者を除く）',
    importance: 'high',
  },
  {
    key: 'num_children',
    label: '子供の人数',
    type: 'number',
    required: false,
    unit: '人',
    placeholder: '0',
    min: 0,
    max: 20,
    step: 1,
    helpText: '子供の人数を入力してください',
    importance: 'high',
  },
  {
    key: 'occupation',
    label: '職業',
    type: 'text',
    required: false,
    placeholder: '例: 会社員、公務員、自営業',
    helpText: '現在の職業を入力してください',
    importance: 'medium',
  },
  {
    key: 'employment_type',
    label: '雇用形態',
    type: 'select',
    required: false,
    options: ['正社員', 'パート・アルバイト', '契約社員', 'フリーランス', '自営業', '無職', '学生', '退職'],
    helpText: '現在の雇用形態を選択してください',
    importance: 'medium',
  },
  {
    key: 'age',
    label: '年齢',
    type: 'number',
    required: false,
    unit: '歳',
    placeholder: '例: 35',
    min: 0,
    max: 150,
    step: 1,
    helpText: '年齢を入力してください',
    importance: 'medium',
  },
  {
    key: 'marital_status',
    label: '婚姻状況',
    type: 'select',
    required: false,
    options: ['独身', '既婚', '離婚', '死別'],
    helpText: '現在の婚姻状況を選択してください',
    importance: 'high',
  },
  {
    key: 'household_income',
    label: '世帯年収',
    type: 'number',
    required: false,
    unit: '万円',
    placeholder: '例: 700',
    min: 0,
    max: 100000,
    step: 10,
    helpText: '世帯全体の年収を万円単位で入力してください',
    importance: 'high',
    validate: validateIncome,
  },
]

// ============================================================================
// システムタブ2: 控除・支出
// ============================================================================

const taxDeductionsFields: FieldDefinition[] = [
  {
    key: 'medical_expenses',
    label: '年間医療費',
    type: 'number',
    required: false,
    unit: '万円',
    placeholder: '例: 15',
    min: 0,
    step: 1,
    helpText: '年間の医療費合計を万円単位で入力してください（医療費控除は10万円超から）',
    importance: 'high',
    validate: validatePositiveNumber,
  },
  {
    key: 'insurance_premium',
    label: '生命保険料（年間）',
    type: 'number',
    required: false,
    unit: '円',
    placeholder: '例: 120000',
    min: 0,
    step: 1000,
    helpText: '年間の生命保険料の合計を入力してください',
    importance: 'medium',
    validate: validatePositiveNumber,
  },
  {
    key: 'earthquake_insurance_premium',
    label: '地震保険料（年間）',
    type: 'number',
    required: false,
    unit: '円',
    placeholder: '例: 50000',
    min: 0,
    step: 1000,
    helpText: '年間の地震保険料を入力してください',
    importance: 'medium',
    validate: validatePositiveNumber,
  },
  {
    key: 'donation_amount',
    label: 'ふるさと納税額',
    type: 'number',
    required: false,
    unit: '円',
    placeholder: '例: 50000',
    min: 0,
    step: 1000,
    helpText: '今年のふるさと納税額を入力してください',
    importance: 'high',
    validate: validatePositiveNumber,
  },
  {
    key: 'social_insurance_premium',
    label: '社会保険料（年間）',
    type: 'number',
    required: false,
    unit: '円',
    placeholder: '例: 600000',
    min: 0,
    step: 1000,
    helpText: '年間の社会保険料（健康保険・厚生年金等）の合計',
    importance: 'medium',
    validate: validatePositiveNumber,
  },
  {
    key: 'housing_loan_balance',
    label: '住宅ローン残高',
    type: 'number',
    required: false,
    unit: '万円',
    placeholder: '例: 2500',
    min: 0,
    step: 10,
    helpText: '年末時点の住宅ローン残高を万円単位で入力してください',
    importance: 'high',
    validate: validatePositiveNumber,
  },
  {
    key: 'has_mortgage',
    label: '住宅ローン控除',
    type: 'select',
    required: false,
    options: ['なし', 'あり（控除適用中）', 'あり（控除終了）'],
    helpText: '住宅ローン控除の適用状況を選択してください',
    importance: 'high',
  },
  {
    key: 'ideco_contribution',
    label: 'iDeCo掛金（月額）',
    type: 'number',
    required: false,
    unit: '円',
    placeholder: '例: 23000',
    min: 0,
    max: 68000,
    step: 1000,
    helpText: 'iDeCoの月額掛金を入力してください（小規模企業共済等掛金控除）',
    importance: 'medium',
    validate: validatePositiveNumber,
  },
]

// ============================================================================
// システムタブ3: 税務書類
// ============================================================================

const documentsFields: FieldDefinition[] = [
  {
    key: 'tax_return_2024',
    label: '2024年確定申告書',
    type: 'file',
    required: false,
    accept: '.pdf',
    helpText: '確定申告書のPDFをアップロードしてください',
    importance: 'high',
  },
  {
    key: 'tax_return_2023',
    label: '2023年確定申告書',
    type: 'file',
    required: false,
    accept: '.pdf',
    helpText: '前年の確定申告書のPDFをアップロードしてください',
    importance: 'medium',
  },
  {
    key: 'withholding_slip_2024',
    label: '2024年源泉徴収票',
    type: 'file',
    required: false,
    accept: '.pdf,.jpg,.jpeg,.png',
    helpText: '源泉徴収票（画像またはPDF）をアップロードしてください',
    importance: 'high',
  },
  {
    key: 'medical_receipts',
    label: '医療費領収書',
    type: 'files',
    required: false,
    accept: '.pdf,.jpg,.jpeg,.png',
    multiple: true,
    helpText: '医療費の領収書をまとめてアップロードしてください',
    importance: 'medium',
  },
  {
    key: 'donation_receipts',
    label: 'ふるさと納税証明書',
    type: 'files',
    required: false,
    accept: '.pdf,.jpg,.jpeg,.png',
    multiple: true,
    helpText: 'ふるさと納税の寄付金受領証明書をアップロードしてください',
    importance: 'high',
  },
  {
    key: 'housing_loan_statement',
    label: '住宅ローン残高証明書',
    type: 'file',
    required: false,
    accept: '.pdf,.jpg,.jpeg,.png',
    helpText: '金融機関から送られてくる残高証明書をアップロードしてください',
    importance: 'high',
  },
  {
    key: 'insurance_certificates',
    label: '保険料控除証明書',
    type: 'files',
    required: false,
    accept: '.pdf,.jpg,.jpeg,.png',
    multiple: true,
    helpText: '生命保険・地震保険の控除証明書をアップロードしてください',
    importance: 'medium',
  },
]

// ============================================================================
// システムタブ定義のエクスポート
// ============================================================================

export const SYSTEM_TABS: SystemTabDefinition[] = [
  {
    id: 'basic_info',
    name: '基本情報',
    description: '年収、家族構成など税務計算に必要な基本情報',
    icon: '👤',
    locked: true,
    fields: basicInfoFields,
    metadata: {
      category: 'profile',
      importance: 'critical',
      tags: ['基本情報', 'プロフィール'],
    },
  },
  {
    id: 'tax_deductions',
    name: '控除・支出',
    description: '医療費、保険料、ふるさと納税など控除対象の情報',
    icon: '💰',
    locked: true,
    fields: taxDeductionsFields,
    metadata: {
      category: 'deduction',
      importance: 'high',
      tags: ['控除', '支出', '節税'],
    },
  },
  {
    id: 'documents',
    name: '税務書類',
    description: '確定申告書、源泉徴収票、領収書などの書類',
    icon: '📄',
    locked: true,
    fields: documentsFields,
    metadata: {
      category: 'tax_doc',
      importance: 'high',
      tags: ['書類', '確定申告', '証明書'],
    },
  },
]

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * システムタブIDからタブ定義を取得
 */
export function getSystemTab(tabId: string): SystemTabDefinition | undefined {
  return SYSTEM_TABS.find((tab) => tab.id === tabId)
}

/**
 * 必須フィールドのリストを取得
 */
export function getRequiredFields(tabId: string): string[] {
  const tab = getSystemTab(tabId)
  if (!tab) return []
  return tab.fields.filter((f) => f.required).map((f) => f.key)
}

/**
 * フィールド定義を取得
 */
export function getFieldDefinition(
  tabId: string,
  fieldKey: string
): FieldDefinition | undefined {
  const tab = getSystemTab(tabId)
  if (!tab) return undefined
  return tab.fields.find((f) => f.key === fieldKey)
}

/**
 * 値をバリデーション
 */
export function validateField(
  tabId: string,
  fieldKey: string,
  value: any
): string | null {
  const field = getFieldDefinition(tabId, fieldKey)
  if (!field) return '不明なフィールドです'

  // 必須チェック
  if (field.required && (value === null || value === undefined || value === '')) {
    return `${field.label}は必須項目です`
  }

  // 型チェック
  if (field.type === 'number' && typeof value === 'number') {
    if (field.min !== undefined && value < field.min) {
      return `${field.label}は${field.min}以上で入力してください`
    }
    if (field.max !== undefined && value > field.max) {
      return `${field.label}は${field.max}以下で入力してください`
    }
  }

  // カスタムバリデーション
  if (field.validate) {
    return field.validate(value)
  }

  return null
}

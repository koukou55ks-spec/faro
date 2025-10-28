/**
 * 既存データをナレッジベースに移行するスクリプト
 *
 * 使い方:
 * npx tsx apps/web/scripts/migrate-to-knowledge-base.ts
 *
 * 対象:
 * - user_profiles テーブルの全データ
 * - messages テーブルの過去の質問・回答
 */

import { createClient } from '@supabase/supabase-js'
import { UserKnowledgeBase } from '../lib/ai/knowledge-base'
import * as dotenv from 'dotenv'
import * as path from 'path'

// .env.local を読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function migrateProfiles() {
  console.log('='.repeat(60))
  console.log('プロフィールデータの移行を開始')
  console.log('='.repeat(60))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not found')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const kb = new UserKnowledgeBase()

  // 全ユーザーのプロフィールを取得
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('プロフィール取得エラー:', error)
    throw error
  }

  console.log(`\n${profiles?.length || 0}件のプロフィールを処理します\n`)

  let successCount = 0
  let errorCount = 0

  for (const profile of profiles || []) {
    try {
      const currentYear = new Date().getFullYear()
      const documents = []

      console.log(`\n処理中: User ${profile.user_id.substring(0, 8)}...`)

      // 年収情報
      if (profile.annual_income) {
        documents.push({
          content: `年収は${Math.round(profile.annual_income / 10000)}万円（${profile.annual_income.toLocaleString()}円）です。`,
          metadata: {
            type: 'profile' as const,
            category: 'income',
            year: currentYear,
            source: 'migration',
            importance: 'high' as const,
          },
        })
      }

      // 世帯年収情報
      if (profile.household_income) {
        documents.push({
          content: `世帯年収は${Math.round(profile.household_income / 10000)}万円（${profile.household_income.toLocaleString()}円）です。`,
          metadata: {
            type: 'profile' as const,
            category: 'income',
            year: currentYear,
            source: 'migration',
            importance: 'high' as const,
          },
        })
      }

      // 配偶者情報
      if (profile.has_spouse !== null) {
        documents.push({
          content: `配偶者は${profile.has_spouse ? 'います' : 'いません'}。`,
          metadata: {
            type: 'profile' as const,
            category: 'family',
            year: currentYear,
            source: 'migration',
            importance: 'high' as const,
          },
        })
      }

      // 扶養家族情報
      if (profile.dependents_count !== null && profile.dependents_count > 0) {
        documents.push({
          content: `扶養家族は${profile.dependents_count}人います。`,
          metadata: {
            type: 'profile' as const,
            category: 'family',
            year: currentYear,
            source: 'migration',
            importance: 'high' as const,
          },
        })
      }

      // 職業・雇用形態
      if (profile.occupation || profile.employment_type) {
        const empTypeMap: Record<string, string> = {
          full_time: '正社員',
          part_time: 'パート・アルバイト',
          contract: '契約社員',
          freelance: 'フリーランス',
          self_employed: '自営業',
          unemployed: '無職',
          student: '学生',
          retired: '退職',
        }
        const occupation = profile.occupation || '不明'
        const empType = profile.employment_type ? empTypeMap[profile.employment_type] || profile.employment_type : ''
        documents.push({
          content: `職業は${occupation}${empType ? `（${empType}）` : ''}です。`,
          metadata: {
            type: 'profile' as const,
            category: 'occupation',
            year: currentYear,
            source: 'migration',
            importance: 'medium' as const,
          },
        })
      }

      // 住宅ローン情報
      if (profile.has_mortgage !== null) {
        documents.push({
          content: `住宅ローンは${profile.has_mortgage ? 'あります' : 'ありません'}。`,
          metadata: {
            type: 'profile' as const,
            category: 'housing',
            year: currentYear,
            source: 'migration',
            importance: 'medium' as const,
          },
        })
      }

      // 医療費情報
      if (profile.medical_expenses && profile.medical_expenses > 0) {
        documents.push({
          content: `年間医療費は${Math.round(profile.medical_expenses / 10000)}万円（${profile.medical_expenses.toLocaleString()}円）です。`,
          metadata: {
            type: 'profile' as const,
            category: 'deduction',
            year: currentYear,
            source: 'migration',
            importance: 'high' as const,
            tags: ['医療費控除'],
          },
        })
      }

      // 保険料情報
      if (profile.insurance_premium && profile.insurance_premium > 0) {
        documents.push({
          content: `年間保険料は${Math.round(profile.insurance_premium / 10000)}万円（${profile.insurance_premium.toLocaleString()}円）です。`,
          metadata: {
            type: 'profile' as const,
            category: 'insurance',
            year: currentYear,
            source: 'migration',
            importance: 'medium' as const,
          },
        })
      }

      // ふるさと納税情報
      if (profile.donation_amount && profile.donation_amount > 0) {
        documents.push({
          content: `ふるさと納税額は${Math.round(profile.donation_amount / 10000)}万円（${profile.donation_amount.toLocaleString()}円）です。`,
          metadata: {
            type: 'profile' as const,
            category: 'deduction',
            year: currentYear,
            source: 'migration',
            importance: 'high' as const,
            tags: ['ふるさと納税', '寄付金控除'],
          },
        })
      }

      // バッチで保存
      if (documents.length > 0) {
        await kb.addDocuments(profile.user_id, documents)
        console.log(`  ✓ ${documents.length}件のドキュメントを保存`)
        successCount++
      } else {
        console.log('  - データなし（スキップ）')
      }
    } catch (err) {
      console.error(`  ✗ エラー:`, err)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('プロフィール移行完了')
  console.log(`成功: ${successCount}件`)
  console.log(`エラー: ${errorCount}件`)
  console.log('='.repeat(60))
}

async function migrateMessages() {
  console.log('\n' + '='.repeat(60))
  console.log('チャット履歴の移行を開始')
  console.log('='.repeat(60))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not found')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const kb = new UserKnowledgeBase()

  // 全会話を取得
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('id, user_id')
    .order('created_at', { ascending: true })

  if (convError) {
    console.error('会話取得エラー:', convError)
    throw convError
  }

  console.log(`\n${conversations?.length || 0}件の会話を処理します\n`)

  let successCount = 0
  let errorCount = 0

  for (const conversation of conversations || []) {
    try {
      // 会話のメッセージを取得（ユーザー→アシスタントのペアで）
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('role, content, created_at')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true })

      if (msgError) {
        console.error(`  会話 ${conversation.id} のメッセージ取得エラー:`, msgError)
        continue
      }

      if (!messages || messages.length === 0) {
        continue
      }

      console.log(`\n処理中: 会話 ${conversation.id.substring(0, 8)}... (${messages.length}メッセージ)`)

      // ユーザー質問とアシスタント回答をペアリング
      for (let i = 0; i < messages.length - 1; i++) {
        const msg = messages[i]
        const nextMsg = messages[i + 1]

        if (msg.role === 'user' && nextMsg.role === 'assistant') {
          const qaContent = `Q: ${msg.content}\n\nA: ${nextMsg.content}`

          await kb.addDocument(conversation.user_id, qaContent, {
            type: 'qa_history',
            category: 'chat',
            year: new Date(msg.created_at).getFullYear(),
            source: 'migration',
            importance: 'medium',
            tags: ['chat', 'qa'],
          })

          console.log(`  ✓ Q&Aペア保存`)
        }
      }

      successCount++
    } catch (err) {
      console.error(`  ✗ エラー:`, err)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('チャット履歴移行完了')
  console.log(`成功: ${successCount}件`)
  console.log(`エラー: ${errorCount}件`)
  console.log('='.repeat(60))
}

async function main() {
  console.log('\n📚 ナレッジベース移行スクリプト\n')

  try {
    // 1. プロフィールデータ移行
    await migrateProfiles()

    // 2. チャット履歴移行
    await migrateMessages()

    console.log('\n✅ すべての移行が完了しました！\n')
  } catch (error) {
    console.error('\n❌ 移行中にエラーが発生しました:', error)
    process.exit(1)
  }
}

main()

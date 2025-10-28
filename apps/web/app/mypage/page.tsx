'use client'

import { useState, useEffect, useMemo } from 'react'
import { User, Loader2, FileText } from 'lucide-react'
import { useUserProfile } from '../../lib/hooks/useUserProfile'
import { useCustomTabs } from '../../lib/hooks/useCustomTabs'
import { useAuth } from '../../lib/hooks/useAuth'
import { ProfileCompletionBar } from '../../components/features/sources/ProfileCompletionBar'
import { RequiredSource } from '../../components/features/sources/RequiredSource'
import { DocumentSource } from '../../components/features/sources/DocumentSource'
import { NoteSource } from '../../components/features/sources/NoteSource'
import { RequiredField } from '../../lib/types/sources'
import { DocumentSource as DocumentSourceType } from '../../lib/types/sources'

export default function MyPage() {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading, updateProfile, refetch } = useUserProfile()
  const { tabs } = useCustomTabs()
  const loading = authLoading || profileLoading

  // プロファイル完成度を計算
  const completion = useMemo(() => {
    if (!profile) return {
      percentage: 0,
      nextStep: {
        field: '年収',
        reason: 'ふるさと納税の上限額を計算するために必要です',
        value: '年10万円の節税可能性'
      }
    }

    const fields = [
      { key: 'annual_income', label: '年収', weight: 2 },
      { key: 'marital_status', label: '婚姻状況', weight: 2 },
      { key: 'num_dependents', label: '扶養家族', weight: 2 },
      { key: 'occupation', label: '職業', weight: 1 },
      { key: 'age', label: '年齢', weight: 1 },
      { key: 'prefecture', label: '都道府県', weight: 1 },
    ]

    const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0)
    const completedWeight = fields.reduce((sum, f) => {
      const value = (profile as any)[f.key]
      return sum + (value ? f.weight : 0)
    }, 0)

    const percentage = Math.round((completedWeight / totalWeight) * 100)
    const missing = fields.find(f => !(profile as any)[f.key])

    return {
      percentage,
      nextStep: {
        field: missing?.label || '',
        reason: missing?.key === 'annual_income' ? 'ふるさと納税の上限額を計算できます' :
                missing?.key === 'marital_status' ? '配偶者控除の適用を判定できます' :
                missing?.key === 'num_dependents' ? '扶養控除の金額を計算できます' :
                'より正確な節税提案ができます',
        value: '年10万円以上の節税可能性'
      }
    }
  }, [profile])

  // 必須フィールドを構築
  const requiredFields = useMemo((): RequiredField[] => {
    const getMaritalStatusDisplay = (value: string) => {
      const map: Record<string, string> = {
        'single': '独身',
        'married': '既婚',
        'divorced': '離婚',
        'widowed': '死別'
      }
      return map[value] || value
    }

    return [
      {
        key: 'annual_income',
        label: '年収',
        value: profile?.annual_income ? `${Math.round(profile.annual_income / 10000)}` : null,
        required: true,
        missing: !profile?.annual_income,
        impact: 'ふるさと納税の上限額を計算',
        type: 'number',
        unit: '万円'
      },
      {
        key: 'marital_status',
        label: '婚姻状況',
        value: profile?.marital_status ? getMaritalStatusDisplay(profile.marital_status) : null,
        required: true,
        missing: !profile?.marital_status,
        impact: '配偶者控除38万円の適用判定',
        type: 'select',
        options: ['独身', '既婚', '離婚', '死別']
      },
      {
        key: 'num_dependents',
        label: '扶養家族',
        value: profile?.num_dependents ?? null,
        required: true,
        missing: profile?.num_dependents === undefined || profile?.num_dependents === null,
        impact: '扶養控除（1人38万円）',
        type: 'number',
        unit: '人'
      },
      {
        key: 'occupation',
        label: '職業',
        value: profile?.occupation || null,
        required: false,
        missing: !profile?.occupation,
        impact: '職業別の控除・制度を提案',
        type: 'text'
      },
      {
        key: 'age',
        label: '年齢',
        value: profile?.age ?? null,
        required: false,
        missing: !profile?.age,
        type: 'number',
        unit: '歳'
      },
      {
        key: 'prefecture',
        label: '都道府県',
        value: profile?.prefecture || null,
        required: false,
        missing: !profile?.prefecture,
        impact: '地域別の制度を提案',
        type: 'text'
      }
    ]
  }, [profile])

  // フィールド更新ハンドラー
  const handleFieldUpdate = async (key: string, value: any) => {
    // 値の変換
    const convertValue = (key: string, val: any) => {
      if (key === 'annual_income' && val) {
        return parseInt(val) * 10000 // 万円を円に
      }
      if (key === 'marital_status') {
        const reverseMap: Record<string, string> = {
          '独身': 'single',
          '既婚': 'married',
          '離婚': 'divorced',
          '死別': 'widowed'
        }
        return reverseMap[val] || val
      }
      if (key === 'num_dependents' || key === 'age') {
        return val ? parseInt(val) : null
      }
      return val
    }

    const updates = { [key]: convertValue(key, value) }

    try {
      await updateProfile(updates)
      await refetch()
    } catch (err) {
      console.error('Failed to update field:', err)
      throw err
    }
  }

  // ドキュメントアップロード（仮実装）
  const handleDocumentUpload = async (file: File) => {
    console.log('Document upload:', file.name)
    // TODO: OCR処理と情報抽出
    alert('ドキュメントアップロード機能は近日公開予定です')
  }

  // ノート画面へ遷移
  const handleNavigateToNotes = () => {
    window.scrollTo({ top: document.getElementById('notes-section')?.offsetTop || 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border-2 border-white/30">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                {user?.email || 'ゲストユーザー'}
              </h1>
              <p className="text-white/80 text-xs">
                マイソース
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* 完成度バー */}
          <ProfileCompletionBar
            percentage={completion.percentage}
            nextStep={completion.nextStep}
          />

          {/* 説明 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>ソースとは？</strong> AIチャットがあなたに最適な回答をするために参照する情報源です。
              どの情報がいつ使われるか明示され、必要な情報だけをAIが自動で参照します。
            </p>
          </div>

          {/* 必須ソース */}
          <RequiredSource
            fields={requiredFields}
            completion={completion.percentage}
            impact={[
              'ふるさと納税の正確な上限額を計算',
              '利用可能な控除をすべて表示',
              '年間10万円以上の節税提案'
            ]}
            onFieldUpdate={handleFieldUpdate}
          />

          {/* ドキュメントソース */}
          <DocumentSource
            documents={[]}
            onUpload={handleDocumentUpload}
          />

          {/* ノートソース */}
          <div id="notes-section">
            <NoteSource
              noteCount={tabs?.length || 0}
              onNavigateToNotes={handleNavigateToNotes}
            />
          </div>

          {/* カスタムタブセクション */}
          <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                カスタムタブ
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              医療費、保険情報などを自由に整理・管理できます。
              AIチャットで関連する質問をすると、自動的に参照されます。
            </p>
            <div className="flex gap-3">
              <a
                href="#custom-tabs"
                onClick={(e) => {
                  e.preventDefault()
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                }}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity text-center"
              >
                カスタムタブを見る
              </a>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            💬 チャットで質問すると、これらのソースが自動的に参照されます
          </p>
        </div>
      </div>
    </div>
  )
}

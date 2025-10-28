'use client'

import { FileText, Upload, Check, AlertCircle } from 'lucide-react'
import { DocumentSource as DocumentSourceType } from '../../../lib/types/sources'

interface DocumentSourceProps {
  documents: DocumentSourceType[]
  onUpload: (file: File) => Promise<void>
}

export function DocumentSource({ documents, onUpload }: DocumentSourceProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await onUpload(file)
    } catch (err) {
      alert('アップロードに失敗しました')
    }
  }

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <FileText className="w-5 h-5 text-blue-500" />
          ドキュメント
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          源泉徴収票や確定申告書などをアップロード
        </p>
      </div>

      {/* アップロード済みドキュメント */}
      {documents.length > 0 && (
        <div className="space-y-3 mb-4">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                      {doc.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(doc.uploadedAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                  処理済み
                </span>
              </div>

              {/* 抽出された情報 */}
              {doc.extractedData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    AIが読み取った情報
                  </p>
                  <div className="space-y-1.5">
                    {doc.extractedData.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {item.value}
                          </span>
                          {item.confidence < 0.9 && (
                            <AlertCircle className="w-3 h-3 text-orange-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 使用箇所 */}
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                📍 {doc.usage}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* アップロードエリア */}
      <label className="block">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer text-center">
          <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ファイルをドロップまたはクリック
          </p>
          <p className="text-xs text-gray-500">
            PDF、画像（JPG、PNG）対応
          </p>
        </div>
      </label>
    </div>
  )
}

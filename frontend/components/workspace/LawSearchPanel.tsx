'use client'

import { useState } from 'react'

interface Law {
  law_id: string
  law_name: string
  law_type: string
  promulgation_date: string
}

export function LawSearchPanel() {
  const [keyword, setKeyword] = useState('')
  const [laws, setLaws] = useState<Law[]>([])
  const [selectedLaw, setSelectedLaw] = useState<string>('')
  const [lawContent, setLawContent] = useState<string>('')
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!keyword.trim()) return

    setIsSearching(true)
    setLaws([])
    setSelectedLaw('')
    setLawContent('')

    try {
      // e-Gov Law API v2 - 直接呼び出し
      const response = await fetch(
        `https://laws.e-gov.go.jp/api/2/lawlists/1?lang=ja&keyword=${encodeURIComponent(keyword)}`,
        { method: 'GET' }
      )

      const xmlText = await response.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

      const lawNodes = xmlDoc.getElementsByTagName('LawNameListInfo')
      const lawsArray: Law[] = []

      for (let i = 0; i < lawNodes.length; i++) {
        const node = lawNodes[i]
        lawsArray.push({
          law_id: node.getAttribute('LawId') || '',
          law_name: node.getAttribute('LawName') || '',
          law_type: node.getAttribute('LawType') || '',
          promulgation_date: node.getAttribute('PromulgationDate') || ''
        })
      }

      setLaws(lawsArray)
    } catch (error) {
      console.error('Error searching laws:', error)
      alert('法令検索に失敗しました')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectLaw = async (lawId: string) => {
    setSelectedLaw(lawId)
    setIsLoading(true)
    setLawContent('')

    try {
      // e-Gov Law API v2 - 法令内容取得
      const response = await fetch(
        `https://laws.e-gov.go.jp/api/2/lawdata/${lawId}`,
        { method: 'GET' }
      )

      const xmlText = await response.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

      // XMLから本文を抽出（簡易版）
      const articleNodes = xmlDoc.getElementsByTagName('Article')
      let content = ''

      for (let i = 0; i < articleNodes.length; i++) {
        const article = articleNodes[i]
        const articleTitle = article.getElementsByTagName('ArticleTitle')[0]?.textContent || ''
        const articleCaption = article.getElementsByTagName('ArticleCaption')[0]?.textContent || ''
        const paragraphs = article.getElementsByTagName('Paragraph')

        content += `\n${articleTitle} ${articleCaption}\n`

        for (let j = 0; j < paragraphs.length; j++) {
          const sentenceNodes = paragraphs[j].getElementsByTagName('Sentence')
          for (let k = 0; k < sentenceNodes.length; k++) {
            content += `  ${sentenceNodes[k].textContent}\n`
          }
        }
      }

      setLawContent(content || '内容を取得できませんでした')
    } catch (error) {
      console.error('Error fetching law:', error)
      setLawContent('法令内容の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="law-panel">
      <div className="law-sidebar">
        <div className="law-header">
          <h3>⚖️ 法令検索</h3>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="法令名・キーワードで検索..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? '検索中...' : <i className="fas fa-search"></i>}
          </button>
        </div>

        <div className="law-list">
          {laws.length === 0 && !isSearching && (
            <div className="empty-state-small">
              <p>キーワードを入力して法令を検索</p>
            </div>
          )}

          {laws.map(law => (
            <div
              key={law.law_id}
              className={`law-item ${selectedLaw === law.law_id ? 'active' : ''}`}
              onClick={() => handleSelectLaw(law.law_id)}
            >
              <div className="law-name">{law.law_name}</div>
              <div className="law-meta">
                <span>{law.law_type}</span>
                <span>{law.promulgation_date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="law-content">
        {!selectedLaw && (
          <div className="empty-state">
            <div className="empty-icon">⚖️</div>
            <h3>法令検索</h3>
            <p>所得税法、法人税法などの日本の法令を検索できます。</p>
          </div>
        )}

        {selectedLaw && (
          <div className="law-viewer">
            <div className="law-viewer-header">
              <h2>{laws.find(l => l.law_id === selectedLaw)?.law_name}</h2>
            </div>
            <div className="law-viewer-content">
              {isLoading ? (
                <div className="loading">読み込み中...</div>
              ) : (
                <pre>{lawContent}</pre>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .law-panel {
          display: flex;
          height: 100%;
          background: var(--bg-primary);
        }

        .law-sidebar {
          width: 360px;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
        }

        .law-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .law-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .search-box {
          padding: 1rem;
          display: flex;
          gap: 0.5rem;
        }

        .search-box input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .search-box button {
          padding: 0 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--accent-primary);
          color: white;
          cursor: pointer;
          transition: all var(--transition);
          font-weight: 600;
        }

        .search-box button:hover:not(:disabled) {
          background: var(--accent-secondary);
        }

        .search-box button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .law-list {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .empty-state-small {
          padding: 2rem 1rem;
          text-align: center;
          color: var(--text-tertiary);
          font-size: 0.9rem;
        }

        .law-item {
          padding: 1rem;
          margin-bottom: 0.75rem;
          border-radius: 8px;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all var(--transition);
        }

        .law-item:hover {
          border-color: var(--accent-primary);
        }

        .law-item.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }

        .law-name {
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .law-meta {
          display: flex;
          gap: 0.75rem;
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .law-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .law-viewer {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 2rem;
        }

        .law-viewer-header {
          margin-bottom: 1.5rem;
        }

        .law-viewer-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .law-viewer-content {
          flex: 1;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 12px;
          overflow-y: auto;
        }

        .law-viewer-content pre {
          white-space: pre-wrap;
          font-family: inherit;
          color: var(--text-primary);
          line-height: 1.8;
          font-size: 0.9rem;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: var(--text-tertiary);
        }
      `}</style>
    </div>
  )
}

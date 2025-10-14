'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
}

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-4">
      {/* Language label and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-gray-700 rounded-t-lg">
        <span className="text-xs font-mono text-gray-400 uppercase">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 transition-colors rounded"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <SyntaxHighlighter
        language={language || 'text'}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem',
        }}
        showLineNumbers
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            const value = String(children).replace(/\n$/, '')

            return !inline && match ? (
              <CodeBlock language={match[1]} value={value} />
            ) : (
              <code className="px-1.5 py-0.5 mx-0.5 bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 rounded text-[0.9em] font-mono">
                {children}
              </code>
            )
          },
          p({ children }) {
            return <p className="mb-4 leading-[1.7] text-[16px]">{children}</p>
          },
          strong({ children }) {
            return <strong className="font-semibold text-foreground">{children}</strong>
          },
          em({ children }) {
            return <em className="italic">{children}</em>
          },
          ul({ children }) {
            return <ul className="my-3 ml-6 list-disc space-y-1.5 leading-[1.7] text-[16px]">{children}</ul>
          },
          ol({ children }) {
            return <ol className="my-3 ml-6 list-decimal space-y-1.5 leading-[1.7] text-[16px]">{children}</ol>
          },
          li({ children }) {
            return <li className="leading-[1.7] pl-1">{children}</li>
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-3 mt-6 leading-[1.4]">{children}</h1>
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-2.5 mt-5 leading-[1.4]">{children}</h2>
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold mb-2 mt-4 leading-[1.4]">{children}</h3>
          },
          h4({ children }) {
            return <h4 className="text-base font-semibold mb-2 mt-3 leading-[1.4]">{children}</h4>
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 my-3 italic text-gray-700 dark:text-gray-300 leading-[1.7]">
                {children}
              </blockquote>
            )
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {children}
                </table>
              </div>
            )
          },
          thead({ children }) {
            return <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
          },
          th({ children }) {
            return (
              <th className="px-4 py-2 text-left text-sm font-semibold leading-[1.7]">
                {children}
              </th>
            )
          },
          td({ children }) {
            return (
              <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-sm leading-[1.7]">
                {children}
              </td>
            )
          },
          a({ children, href }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {children}
              </a>
            )
          },
          hr() {
            return <hr className="my-6 border-t border-gray-200 dark:border-gray-700" />
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

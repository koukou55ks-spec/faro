import '@testing-library/jest-dom'

// グローバルなモック設定
global.fetch = jest.fn()

// Next.js環境変数のモック
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.GEMINI_API_KEY = 'test-gemini-key'

import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Testing Library の matchers を追加
expect.extend(matchers)

// 各テスト後にクリーンアップ
afterEach(() => {
  cleanup()
})

// 環境変数のモック
vi.mock('process.env', () => ({
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  GEMINI_API_KEY: 'test-gemini-key',
}))

// next/navigation のモック
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

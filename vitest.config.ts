import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./apps/web/vitest.setup.ts'],
    include: ['apps/web/**/*.{test,spec}.{js,jsx,ts,tsx}', 'packages/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['apps/**/*.{js,jsx,ts,tsx}', 'packages/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'node_modules/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/types/**',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
      ],
    },
  },
  resolve: {
    alias: {
      '@faro/core': path.resolve(__dirname, './packages/core/src'),
      '@faro/infrastructure': path.resolve(__dirname, './packages/infrastructure/src'),
      '@faro/shared': path.resolve(__dirname, './packages/shared/src'),
      '@faro/ui': path.resolve(__dirname, './packages/ui/src'),
      '@faro/ai-agent': path.resolve(__dirname, './packages/ai-agent/src'),
    },
  },
})

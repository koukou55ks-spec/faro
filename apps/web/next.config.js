const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ソースマップを完全に無効化（404エラー防止）
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Turbopack configuration (Next.js 15)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Experimental features
  experimental: {
    // Server Actions enabled
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // 開発環境: ソースマップ警告を抑制
    if (dev) {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        /Failed to parse source map/,
        /source-map-loader/,
      ];
    }

    return config;
  },
  // カスタムロガー（404ログをフィルタリング）
  onDemandEntries: {
    // 開発時のログ設定
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
}

// Sentry設定でラップ
module.exports = withSentryConfig(
  nextConfig,
  {
    // ビルド時のSentry設定
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    // Sentryアップロード設定
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  }
)

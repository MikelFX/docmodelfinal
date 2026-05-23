const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfjs-dist'],
  turbopack: {
    resolveAlias: {
      'fflate': path.resolve(__dirname, 'node_modules/fflate/esm/browser.js'),
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async headers() {
    return [
      {
        source: '/.well-known/assetlinks.json',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ]
  },
}
module.exports = nextConfig

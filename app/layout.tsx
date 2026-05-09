import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { LanguageProvider } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DocThink — Chráním tě před špatnou smlouvou',
  description: 'Nahraj smlouvu, AI analyzuje rizika za 10 sekund. Verdikt: podepsat / upravit / odmítnout.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DocThink',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7F77DD',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="cs">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#7F77DD" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="DocThink" />
        </head>
        <body className={geist.className}>
          <LanguageProvider>
            {children}
            <LanguageSwitcher />
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

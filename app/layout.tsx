import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { LanguageProvider } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DocThink — AI document analyzer',
  description: 'Upload a document and get summaries, action items and risks using AI.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="cs">
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

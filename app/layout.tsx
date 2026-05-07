import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { LanguageProvider } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DocThink — AI analyzátor dokumentů',
  description: 'Nahraj dokument a získej shrnutí, akční body a rizika pomocí AI.',
  viewport: 'width=device-width, initial-scale=1',
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

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { T, LangKey, Translations } from '@/lib/i18n'

interface LanguageContextType {
  lang: LangKey
  setLang: (lang: LangKey) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'cs',
  setLang: () => {},
  t: T.cs,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangKey>('cs')

  useEffect(() => {
    const saved = localStorage.getItem('docthink_lang') as LangKey
    if (saved && T[saved]) setLangState(saved)
  }, [])

  function setLang(l: LangKey) {
    setLangState(l)
    localStorage.setItem('docthink_lang', l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: T[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

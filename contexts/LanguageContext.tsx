'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getT, isValidLang, LangKey, Translations } from '@/lib/i18n'

interface LanguageContextType {
  lang: LangKey
  setLang: (lang: LangKey) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: getT('en'),
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangKey>('en')

  useEffect(() => {
    const saved = localStorage.getItem('docthink_lang')
    if (saved && isValidLang(saved)) setLangState(saved)
  }, [])

  function setLang(l: LangKey) {
    setLangState(l)
    localStorage.setItem('docthink_lang', l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: getT(lang) }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

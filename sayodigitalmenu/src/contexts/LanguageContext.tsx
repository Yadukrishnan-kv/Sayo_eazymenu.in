import { createContext, useCallback, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type Lang = 'en' | 'ar'

interface LanguageContextValue {
  language: Lang
  setLanguage: (lang: Lang) => void
  isRtl: boolean
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const language = (i18n.language === 'ar' ? 'ar' : 'en') as Lang
  const isRtl = language === 'ar'

  const setLanguage = useCallback(
    (lang: Lang) => {
      i18n.changeLanguage(lang)
    },
    [i18n],
  )

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
  }, [language, isRtl])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRtl }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import './LanguageSheet.css'

type Lang = 'en' | 'ar'

const LANG_OPTIONS: { lang: Lang; flag: string; labelKey: string }[] = [
  { lang: 'en', flag: '🇺🇸', labelKey: 'language.en' },
  { lang: 'ar', flag: '🇸🇦', labelKey: 'language.ar' },
]

interface LanguageSheetProps {
  open: boolean
  onClose: () => void
}

export function LanguageSheet({ open, onClose }: LanguageSheetProps) {
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()

  const handleSelect = (lang: Lang) => {
    setLanguage(lang)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="language-sheet__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            className="language-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-sheet-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          >
            <div className="language-sheet__handle" aria-hidden />
            <div className="language-sheet__header">
              <h2 id="language-sheet-title" className="language-sheet__title">
                {t('language.ariaLabel')}
              </h2>
              <button
                type="button"
                className="language-sheet__close"
                onClick={onClose}
                aria-label={t('modal.close')}
              >
                ×
              </button>
            </div>
            <div className="language-sheet__body">
              <p className="language-sheet__hint">{t('language.choose')}</p>
              {LANG_OPTIONS.map(({ lang, flag, labelKey }) => (
                <button
                  key={lang}
                  type="button"
                  className={`language-sheet__option ${language === lang ? 'language-sheet__option--active' : ''}`}
                  onClick={() => handleSelect(lang)}
                  aria-pressed={language === lang}
                  aria-label={t(labelKey)}
                >
                  <span className="language-sheet__flag" aria-hidden="true">
                    {flag}
                  </span>
                  <span className="language-sheet__label">{t(labelKey)}</span>
                  {language === lang && (
                    <span className="language-sheet__check" aria-hidden="true">✓</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

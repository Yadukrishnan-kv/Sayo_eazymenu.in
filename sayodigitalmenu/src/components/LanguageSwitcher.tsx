import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import './LanguageSwitcher.css'

const LANG_CONFIG = [
  { lang: 'en' as const, flag: '🇺🇸', labelKey: 'language.en' },
  { lang: 'ar' as const, flag: '🇸🇦', labelKey: 'language.ar' },
]

export function LanguageSwitcher() {
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()

  return (
    <div
      className="language-switcher"
      role="group"
      aria-label={t('language.ariaLabel')}
    >
      {LANG_CONFIG.map(({ lang, flag, labelKey }) => (
        <button
          key={lang}
          type="button"
          className={`language-switcher__btn ${language === lang ? 'language-switcher__btn--active' : ''}`}
          onClick={() => setLanguage(lang)}
          aria-pressed={language === lang}
          aria-label={t(labelKey)}
        >
          {language === lang && (
            <motion.span
              className="language-switcher__pill"
              layoutId="lang-pill"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="language-switcher__content">
            <span className="language-switcher__flag" aria-hidden="true">{flag}</span>
            <span className="language-switcher__label">{lang.toUpperCase()}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

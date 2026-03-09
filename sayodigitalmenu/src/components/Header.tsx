import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useMenu } from '../contexts/MenuContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeIcon } from './ThemeIcon'
import './Header.css'

const navKeys = [
  'starItems',
  'appetizers',
  'mains',
  'desserts',
  'drinks',
  'combos',
] as const

const LOGOS = {
  dark: { en: '/assets/Logo_lgt_EN.svg', ar: '/assets/Logo_lgt_AR.svg' },
  light: { en: '/assets/Logo_EN.svg', ar: '/assets/Logo_AR.svg' },
} as const

export function Header() {
  const { t } = useTranslation()
  const { toggleTheme, isDark } = useTheme()
  const { language } = useLanguage()
  const { setCategory, filters } = useMenu()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const themeKey = isDark ? 'dark' : 'light'
  const langKey = language === 'ar' ? 'ar' : 'en'
  const logoSrc = LOGOS[themeKey][langKey]

  return (
    <header className="header navbar-glass" role="banner">
      <div className="header__inner">
        <a href="#" className="header__logo" aria-label="SAYO Home">
          <img src={logoSrc} alt="SAYO" className="header__logo-img" width={120} height={57} />
        </a>

        <nav className="header__nav" aria-label="Main menu">
          <ul className="header__nav-list">
            {navKeys.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  className={`header__nav-link ${filters.category === key ? 'header__nav-link--active' : ''}`}
                  onClick={() => {
                    setCategory(key)
                    setMobileMenuOpen(false)
                  }}
                >
                  {t(`nav.${key}`)}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <button
            type="button"
            className="header__theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
            title={isDark ? t('theme.light') : t('theme.dark')}
          >
            <span className="header__theme-icon" aria-hidden="true">
              <ThemeIcon isDark={isDark} />
            </span>
            <span className="header__theme-label">{isDark ? t('theme.light') : t('theme.dark')}</span>
          </button>
          <LanguageSwitcher />

          <button
            type="button"
            className="header__burger"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="header__mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <ul className="header__mobile-list">
              {navKeys.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    className={`header__mobile-link ${filters.category === key ? 'header__mobile-link--active' : ''}`}
                    onClick={() => {
                      setCategory(key)
                      setMobileMenuOpen(false)
                    }}
                  >
                    {t(`nav.${key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

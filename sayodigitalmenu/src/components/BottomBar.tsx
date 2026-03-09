import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useMenu } from '../contexts/MenuContext'
import { ThemeIcon } from './ThemeIcon'
import { FilterIcon } from './FilterIcon'
import { LanguageSheet } from './LanguageSheet'
import './BottomBar.css'

export function BottomBar() {
  const { t } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const { language } = useLanguage()
  const { filters } = useMenu()
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const hasActiveFilters =
    filters.subcategory !== 'all' ||
    filters.diet !== 'all' ||
    filters.sortBy !== 'default' ||
    filters.chefSpecialOnly

  const isFilterActive = isFilterOpen || hasActiveFilters

  useEffect(() => {
    const onOpen = () => setIsFilterOpen(true)
    const onClose = () => setIsFilterOpen(false)
    document.addEventListener('sayo-filters-opened', onOpen)
    document.addEventListener('sayo-filters-closed', onClose)
    return () => {
      document.removeEventListener('sayo-filters-opened', onOpen)
      document.removeEventListener('sayo-filters-closed', onClose)
    }
  }, [])

  const openFilters = () => {
    if (typeof document !== 'undefined') {
      document.dispatchEvent(new CustomEvent('sayo-open-filters'))
    }
  }

  return (
    <>
      <nav className="bottom-bar" aria-label="Quick actions">
        <button
          type="button"
          className="bottom-bar__item"
          onClick={() => setLanguageSheetOpen(true)}
          aria-label={t('language.ariaLabel')}
        >
          <span className="bottom-bar__icon" aria-hidden="true">
            {language === 'en' ? '🇺🇸' : '🇸🇦'}
          </span>
          <span className="bottom-bar__label">
            {language === 'en' ? t('language.en') : t('language.ar')}
          </span>
        </button>

        <button
          type="button"
          className="bottom-bar__item"
          onClick={toggleTheme}
          aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
        >
          <span className="bottom-bar__icon bottom-bar__icon-svg" aria-hidden="true">
            <ThemeIcon isDark={isDark} />
          </span>
          <span className="bottom-bar__label">
            {isDark ? t('theme.light') : t('theme.dark')}
          </span>
        </button>

        <button
          type="button"
          className={`bottom-bar__item ${isFilterActive ? 'bottom-bar__item--primary' : ''}`}
          onClick={openFilters}
        >
          <span className="bottom-bar__icon bottom-bar__icon-svg" aria-hidden="true">
            <FilterIcon />
          </span>
          <span className="bottom-bar__label">{t('filters.title')}</span>
        </button>
      </nav>

      <LanguageSheet
        open={languageSheetOpen}
        onClose={() => setLanguageSheetOpen(false)}
      />
    </>
  )
}


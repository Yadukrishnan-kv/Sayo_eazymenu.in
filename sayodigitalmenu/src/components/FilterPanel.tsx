import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useMenu } from '../contexts/MenuContext'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { ThemeIcon } from './ThemeIcon'
import { ViewIcon } from './ViewIcon'
import { FilterIcon } from './FilterIcon'
import { LanguageSwitcher } from './LanguageSwitcher'
import type { Diet, MenuFilters } from '../types/menu'
import './FilterPanel.css'

const SIDEBAR_LOGOS = {
  dark: { en: '/assets/Logo_lgt_EN.svg', ar: '/assets/Logo_lgt_AR.svg' },
  light: { en: '/assets/Logo_EN.svg', ar: '/assets/Logo_AR.svg' },
} as const

const navKeys = [
  'all',
  'food',
  'kids',
  'beverages',
] as const

const dietOptions: { value: Diet; key: string }[] = [
  { value: 'all', key: 'all' },
  { value: 'vegetarian', key: 'vegetarian' },
  { value: 'non-vegetarian', key: 'nonVegetarian' },
]

const sortOptions: { value: MenuFilters['sortBy']; key: string }[] = [
  { value: 'default', key: 'sortDefault' },
  { value: 'price-desc', key: 'sortPriceDesc' },
]

function getFilterLabel(
  t: (key: string, options?: any) => string,
  filters: MenuFilters,
  subcategoryLabels: Map<string, string>,
): string[] {
  const labels: string[] = []
  if (filters.subcategory !== 'all' && subcategoryLabels.has(filters.subcategory)) {
    labels.push(subcategoryLabels.get(filters.subcategory)!)
  }
  if (filters.diet !== 'all') {
    labels.push(t(`filters.${filters.diet === 'vegetarian' ? 'vegetarian' : 'nonVegetarian'}`))
  }
  if (filters.sortBy !== 'default') {
    const sortOpt = sortOptions.find((o) => o.value === filters.sortBy)
    if (sortOpt) labels.push(t(`filters.${sortOpt.key}`))
  }
  if (filters.chefSpecialOnly) {
    labels.push(t('filters.chefSpecial'))
  }
  return labels
}

export function FilterPanel() {
  const { t } = useTranslation()
  const { toggleTheme, isDark } = useTheme()
  const { language } = useLanguage()
  const {
    filters,
    setCategory,
    setSubcategory,
    availableSubcategories,
    viewMode,
    setViewMode,
    setDiet,
    setSortBy,
    setChefSpecialOnly,
  } = useMenu()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const subcategoryLabels = new Map(
    availableSubcategories.map((s) => [
      s.key,
      language === 'ar' ? (s.nameAr || s.nameEn) : s.nameEn,
    ])
  )

  const hasActiveFilters =
    filters.subcategory !== 'all' ||
    filters.diet !== 'all' ||
    filters.sortBy !== 'default' ||
    filters.chefSpecialOnly

  const activeFilterLabels = getFilterLabel(t, filters, subcategoryLabels)

  // Allow other components (e.g. mobile bottom bar) to open the drawer
  useEffect(() => {
    const handler = () => setDrawerOpen(true)
    document.addEventListener('sayo-open-filters' as any, handler)
    return () => {
      document.removeEventListener('sayo-open-filters' as any, handler)
    }
  }, [])

  // Notify when drawer opens/closes so BottomBar can show active state
  useEffect(() => {
    const event = drawerOpen ? 'sayo-filters-opened' : 'sayo-filters-closed'
    document.dispatchEvent(new CustomEvent(event))
  }, [drawerOpen])

  return (
    <>
      <motion.aside
        className="filter-panel"
        role="search"
        aria-label={t('filters.title')}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div className="filter-panel__inner">
          <a href="#" className="filter-panel__logo" aria-label="SAYO">
            <img
              src={SIDEBAR_LOGOS[isDark ? 'dark' : 'light'][language === 'ar' ? 'ar' : 'en']}
              alt="SAYO"
              className="filter-panel__logo-img"
              width={140}
              height={67}
            />
          </a>
          <nav className="filter-panel__nav" aria-label={t('nav.menu')}>
            <h2 className="filter-panel__sidebar-title">{t('nav.menu')}</h2>
            <ul className="filter-panel__nav-list">
              {navKeys.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    className={`filter-panel__nav-link ${filters.category === key ? 'filter-panel__nav-link--active' : ''}`}
                    onClick={() => setCategory(key)}
                  >
                    {key === 'all' ? t('nav.showAll') : t(`nav.${key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="filter-panel__filter-block">
            <h2 className="filter-panel__sidebar-title filter-panel__sidebar-title--section">{t('filters.title')}</h2>
            <ul className="filter-panel__option-list" role="group" aria-label={t('filters.title')}>
              {availableSubcategories.length > 1 && (
                <>
                  <li className="filter-panel__option-list-divider" aria-hidden="true" />
                  <li>
                    <button
                      type="button"
                      className={`filter-panel__option-link ${filters.subcategory === 'all' ? 'filter-panel__option-link--active' : ''}`}
                      onClick={() => setSubcategory('all')}
                      aria-pressed={filters.subcategory === 'all'}
                    >
                      {t('filters.all')}
                    </button>
                  </li>
                  {availableSubcategories.map(({ key, nameEn, nameAr }) => (
                    <li key={key}>
                      <button
                        type="button"
                        className={`filter-panel__option-link ${filters.subcategory === key ? 'filter-panel__option-link--active' : ''}`}
                        onClick={() => setSubcategory(key)}
                        aria-pressed={filters.subcategory === key}
                      >
                        {language === 'ar' ? (nameAr || nameEn) : nameEn}
                      </button>
                    </li>
                  ))}
                  <li className="filter-panel__option-list-divider" aria-hidden="true" />
                </>
              )}
              <li>
                <span className="filter-panel__option-list-label">{t('filters.diet')}</span>
              </li>
              {dietOptions.map(({ value, key }) => (
                <li key={`diet-${value}`}>
                  <button
                    type="button"
                    className={`filter-panel__option-link ${filters.diet === value ? 'filter-panel__option-link--active' : ''}`}
                    onClick={() => setDiet(value)}
                    aria-pressed={filters.diet === value}
                  >
                    {t(`filters.${key}`)}
                  </button>
                </li>
              ))}
              {sortOptions.filter((o) => o.value !== 'default').map(({ value, key }) => (
                <li key={`sort-${value}`}>
                  <button
                    type="button"
                    className={`filter-panel__option-link ${filters.sortBy === value ? 'filter-panel__option-link--active' : ''}`}
                    onClick={() => setSortBy(value)}
                    aria-pressed={filters.sortBy === value}
                  >
                    {t(`filters.${key}`)}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  role="switch"
                  className={`filter-panel__option-link ${filters.chefSpecialOnly ? 'filter-panel__option-link--active' : ''}`}
                  onClick={() => setChefSpecialOnly(!filters.chefSpecialOnly)}
                  aria-pressed={filters.chefSpecialOnly}
                >
                  {t('filters.chefSpecial')}
                </button>
              </li>
            </ul>
          </div>
          <div className="filter-panel__sidebar-footer">
            <div className="filter-panel__footer-row">
              <div className="filter-panel__theme-wrap">
                <span className="filter-panel__theme-label">{isDark ? t('theme.light') : t('theme.dark')}</span>
                <button
                  type="button"
                  className="filter-panel__theme-btn"
                  onClick={toggleTheme}
                  aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
                  title={isDark ? t('theme.light') : t('theme.dark')}
                >
                  <ThemeIcon isDark={isDark} />
                </button>
              </div>
              <div className="filter-panel__view-wrap">
                <span className="filter-panel__view-label">
                  {viewMode === 'grid' ? t('filters.viewListShort') : t('filters.viewGridShort')}
                </span>
                <button
                  type="button"
                  className="filter-panel__view-btn"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  aria-label={viewMode === 'grid' ? t('filters.viewList') : t('filters.viewGrid')}
                  title={viewMode === 'grid' ? t('filters.viewListShort') : t('filters.viewGridShort')}
                >
                  <ViewIcon viewMode={viewMode} />
                </button>
              </div>
            </div>
            <div className="filter-panel__language-wrap">
              <span className="filter-panel__language-label">{t('language.ariaLabel')}</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        <button
          type="button"
          className="filter-panel__drawer-trigger"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-label={t('filters.showFilters')}
        >
          <span className="filter-panel__drawer-icon" aria-hidden="true">
            <FilterIcon />
          </span>
          <span>{t('filters.showFilters')}</span>
          {hasActiveFilters && (
            <span className="filter-panel__drawer-badge" aria-hidden="true">
              {activeFilterLabels.length}
            </span>
          )}
        </button>
      </motion.aside>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="filter-panel__backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />
            <motion.div
              className="filter-panel__drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              role="dialog"
              aria-label={t('filters.title')}
            >
              <div className="filter-panel__drawer-handle" aria-hidden />
              <div className="filter-panel__drawer-header">
                <h3 className="filter-panel__drawer-title">{t('filters.title')}</h3>
                <button
                  type="button"
                  className="filter-panel__drawer-close"
                  onClick={() => setDrawerOpen(false)}
                  aria-label={t('filters.hideFilters')}
                >
                  ×
                </button>
              </div>
              <div className="filter-panel__drawer-body">
                <div className="filter-panel__drawer-section">
                  <h4 className="filter-panel__drawer-section-title">{t('nav.menu')}</h4>
                  <ul className="filter-panel__drawer-nav-list" role="group" aria-label={t('nav.menu')}>
                    {navKeys.map((key) => (
                      <li key={key}>
                        <button
                          type="button"
                          className={`filter-panel__drawer-option-link filter-panel__drawer-nav-link ${filters.category === key ? 'filter-panel__drawer-option-link--active' : ''}`}
                          onClick={() => {
                            setCategory(key)
                            setDrawerOpen(false)
                          }}
                          aria-pressed={filters.category === key}
                        >
                          {key === 'all' ? t('nav.showAll') : t(`nav.${key}`)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="filter-panel__drawer-section">
                  <h4 className="filter-panel__drawer-section-title">{t('filters.title')}</h4>
                  <ul className="filter-panel__drawer-option-list" role="group" aria-label={t('filters.title')}>
                  {availableSubcategories.length > 1 && (
                    <>
                      <li>
                        <button
                          type="button"
                          className={`filter-panel__drawer-option-link ${filters.subcategory === 'all' ? 'filter-panel__drawer-option-link--active' : ''}`}
                          onClick={() => setSubcategory('all')}
                          aria-pressed={filters.subcategory === 'all'}
                        >
                          {t('filters.all')}
                        </button>
                      </li>
                      {availableSubcategories.map(({ key, nameEn, nameAr }) => (
                        <li key={key}>
                          <button
                            type="button"
                            className={`filter-panel__drawer-option-link ${filters.subcategory === key ? 'filter-panel__drawer-option-link--active' : ''}`}
                            onClick={() => setSubcategory(key)}
                            aria-pressed={filters.subcategory === key}
                          >
                            {language === 'ar' ? (nameAr || nameEn) : nameEn}
                          </button>
                        </li>
                      ))}
                    </>
                  )}
                  <li>
                    <span className="filter-panel__drawer-section-subtitle">{t('filters.diet')}</span>
                  </li>
                  {dietOptions.map(({ value, key }) => (
                    <li key={`diet-${value}`}>
                      <button
                        type="button"
                        className={`filter-panel__drawer-option-link ${filters.diet === value ? 'filter-panel__drawer-option-link--active' : ''}`}
                        onClick={() => setDiet(value)}
                        aria-pressed={filters.diet === value}
                      >
                        {t(`filters.${key}`)}
                      </button>
                    </li>
                  ))}
                  <li>
                    <span className="filter-panel__drawer-section-subtitle">{t('filters.sortBy')}</span>
                  </li>
                  {sortOptions.filter((o) => o.value !== 'default').map(({ value, key }) => (
                    <li key={`sort-${value}`}>
                      <button
                        type="button"
                        className={`filter-panel__drawer-option-link ${filters.sortBy === value ? 'filter-panel__drawer-option-link--active' : ''}`}
                        onClick={() => setSortBy(value)}
                        aria-pressed={filters.sortBy === value}
                      >
                        {t(`filters.${key}`)}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      role="switch"
                      className={`filter-panel__drawer-option-link ${filters.chefSpecialOnly ? 'filter-panel__drawer-option-link--active' : ''}`}
                      onClick={() => setChefSpecialOnly(!filters.chefSpecialOnly)}
                      aria-pressed={filters.chefSpecialOnly}
                    >
                      {t('filters.chefSpecial')}
                    </button>
                  </li>
                </ul>
                </div>

                <div className="filter-panel__drawer-section">
                  <h4 className="filter-panel__drawer-section-title">{t('filters.view')}</h4>
                  <div className="filter-panel__view-toggle" role="group" aria-label={t('filters.viewGrid')}>
                    <button
                      type="button"
                      className={`filter-panel__view-btn ${viewMode === 'grid' ? 'filter-panel__view-btn--active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      aria-pressed={viewMode === 'grid'}
                      aria-label={t('filters.viewGrid')}
                    >
                      <ViewIcon viewMode="list" />
                    </button>
                    <button
                      type="button"
                      className={`filter-panel__view-btn ${viewMode === 'list' ? 'filter-panel__view-btn--active' : ''}`}
                      onClick={() => setViewMode('list')}
                      aria-pressed={viewMode === 'list'}
                      aria-label={t('filters.viewList')}
                    >
                      <ViewIcon viewMode="grid" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

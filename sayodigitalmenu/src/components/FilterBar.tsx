import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useMenu } from '../contexts/MenuContext'
import type { Diet, PriceRange, MenuFilters } from '../types/menu'
import './FilterBar.css'

const dietOptions: { value: Diet; key: string }[] = [
  { value: 'all', key: 'all' },
  { value: 'vegetarian', key: 'vegetarian' },
  { value: 'non-vegetarian', key: 'nonVegetarian' },
]

const priceOptions: { value: PriceRange; labelKey: string; priceNum?: number }[] = [
  { value: 'all', labelKey: 'anyPrice' },
  { value: 'under30', labelKey: 'under', priceNum: 30 },
  { value: 'under50', labelKey: 'under', priceNum: 50 },
  { value: 'under100', labelKey: 'under', priceNum: 100 },
  { value: 'over100', labelKey: 'over100' },
]

export function FilterBar() {
  const { t } = useTranslation()
  const {
    filters,
    setDiet,
    setPriceRange,
    setSortBy,
    clearFilters,
    filteredDishes,
  } = useMenu()

  const hasActiveFilters =
    filters.diet !== 'all' ||
    filters.priceRange !== 'all' ||
    filters.sortBy !== 'default'

  return (
    <motion.aside
      className="filter-bar"
      role="search"
      aria-label={t('filters.title')}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="filter-bar__inner">
        <div className="filter-bar__group">
          <span className="filter-bar__label">{t('filters.diet')}</span>
          <div className="filter-bar__chips">
            {dietOptions.map(({ value, key }) => (
              <button
                key={value}
                type="button"
                className={`filter-bar__chip ${filters.diet === value ? 'filter-bar__chip--active' : ''}`}
                onClick={() => setDiet(value)}
                aria-pressed={filters.diet === value}
              >
                {t(`filters.${key}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-bar__group">
          <span className="filter-bar__label">{t('filters.priceRange')}</span>
          <div className="filter-bar__chips filter-bar__chips--wrap">
            {priceOptions.map(({ value, labelKey, priceNum }) => (
              <button
                key={value}
                type="button"
                className={`filter-bar__chip filter-bar__chip--sm ${filters.priceRange === value ? 'filter-bar__chip--active' : ''}`}
                onClick={() => setPriceRange(value)}
                aria-pressed={filters.priceRange === value}
              >
                {value === 'all' ? t(`filters.${labelKey}`) : value === 'over100' ? '100+ SAR' : t(`filters.${labelKey}`, { price: priceNum })}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-bar__group">
          <span className="filter-bar__label">{t('filters.popularity')}</span>
          <select
            className="filter-bar__select"
            value={filters.sortBy}
            onChange={(e) => setSortBy(e.target.value as MenuFilters['sortBy'])}
            aria-label={t('filters.popularity')}
          >
            <option value="default">Default</option>
            <option value="popularity">Most popular</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="filter-bar__clear"
            onClick={clearFilters}
          >
            {t('filters.clearAll')}
          </button>
        )}
      </div>

      <p className="filter-bar__count" aria-live="polite">
        {filteredDishes.length} {t('nav.menu').toLowerCase()}
      </p>
    </motion.aside>
  )
}


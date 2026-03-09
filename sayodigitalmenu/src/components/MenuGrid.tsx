import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useMenu } from '../contexts/MenuContext'
import { useLanguage } from '../contexts/LanguageContext'
import { DishCard } from './DishCard'
import { categoryOrder } from '../data/menuData'
import type { Dish } from '../types/menu'
import './MenuGrid.css'

function groupByCategory(dishes: Dish[]): Map<string, Dish[]> {
  const map = new Map<string, Dish[]>()
  for (const dish of dishes) {
    const key = dish.categoryKey
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(dish)
  }
  return map
}

const gridSectionKeys = categoryOrder.filter(
  (k) => k !== 'starItems' && k !== 'chefSpecialties'
)

const foodSectionKeys = gridSectionKeys.filter((k) => k !== 'drinks' && k !== 'combos')

type SectionItem = {
  key: string
  titleKey?: string
  nameEn?: string
  nameAr?: string
  dishes: Dish[]
}

export function MenuGrid() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { menuLoading, filteredDishes, viewMode, filters } = useMenu()

  const sections = useMemo((): SectionItem[] => {
    const category = filters.category

    if (category === 'kids') {
      return filteredDishes.length > 0
        ? [{ key: 'kids', titleKey: 'nav.kids', dishes: filteredDishes }]
        : []
    }
    if (category === 'beverages') {
      return filteredDishes.length > 0
        ? [{ key: 'beverages', titleKey: 'nav.beverages', dishes: filteredDishes }]
        : []
    }

    const byCategory = groupByCategory(filteredDishes)
    const sectionKeys = category === 'food' ? foodSectionKeys : gridSectionKeys
    const knownKeysSet = new Set(sectionKeys)
    const fixedSections: SectionItem[] = sectionKeys
      .map((key) => {
        const dishes = byCategory.get(key) ?? []
        const first = dishes[0]
        return {
          key,
          titleKey: `categories.${key}`,
          nameEn: first?.category || key,
          nameAr: first?.categoryAr || first?.category || key,
          dishes,
        }
      })
      .filter((s) => s.dishes.length > 0)
    const dynamicKeys = [...byCategory.keys()].filter((k) => !knownKeysSet.has(k))
    const dynamicSections: SectionItem[] = dynamicKeys.map((key) => {
      const dishes = byCategory.get(key) ?? []
      const first = dishes[0]
      return {
        key,
        nameEn: first?.category || key,
        nameAr: first?.categoryAr || first?.category || key,
        dishes,
      }
    })
    const result = [...fixedSections, ...dynamicSections]
    if (result.length === 0 && filteredDishes.length > 0) {
      return [{ key: 'menu', titleKey: 'nav.menu', dishes: filteredDishes }]
    }
    return result
  }, [filteredDishes, filters.category])

  if (filteredDishes.length === 0) {
    return (
      <section id="menu-grid" className="menu-grid" aria-label="Menu items">
        <div className="menu-grid__inner">
          <p className={menuLoading ? 'menu-grid__loading' : 'menu-grid__empty'}>
            {menuLoading ? t('menuGrid.loading') : t('menuGrid.empty')}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="menu-grid"
      className={`menu-grid ${viewMode === 'list' ? 'menu-grid--list' : ''}`}
      aria-label="Menu items"
    >
      <div className="menu-grid__inner">
        {sections.map(({ key, titleKey, nameEn, nameAr, dishes }, sectionIndex) => {
          const sectionTitle =
            nameEn != null
              ? (language === 'ar' ? (nameAr || nameEn) : nameEn)
              : (titleKey ? t(titleKey) : key)
          return (
          <motion.div
            key={key}
            className="menu-grid__section"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={`menu-grid__section-hero menu-grid__section-hero--${key}`} data-category={key}>
              <h2 className="menu-grid__section-title">
                {sectionTitle}
              </h2>
            </div>
            <div className="menu-grid__list">
              {dishes.map((dish, index) => (
                <DishCard key={dish.id} dish={dish} index={sectionIndex * 20 + index} />
              ))}
            </div>
          </motion.div>
          )
        })}
      </div>
    </section>
  )
}

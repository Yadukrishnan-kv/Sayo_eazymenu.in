import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { useMenu } from '../contexts/MenuContext'
import { getCountryFlag } from '../utils/countryFlag'
import { SpiceLevel } from './SpiceLevel'
import { DishTags } from './DishTags'
import { DishCard } from './DishCard'
import type { Dish } from '../types/menu'
import './StarItemsSection.css'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
}

export function StarItemsSection() {
  const { t } = useTranslation()
  const { dishes, openDishModal, viewMode } = useMenu()
  const scrollRef = useRef<HTMLDivElement>(null)

  const starDishes = dishes.filter((d) => d.isStar || d.isChefSpecialty)

  if (starDishes.length === 0) return null

  return (
    <section
      id="star-items"
      className="star-items"
      aria-labelledby="star-items-heading"
    >
      <div className="star-items__inner">
        <div className="star-items__heading-row">
          <h2 id="star-items-heading" className="star-items__heading">
            {t('categories.starItems')}
          </h2>
          <div className="star-items__controls" aria-hidden="true">
            <button
              type="button"
              className="star-items__control-btn star-items__control-btn--prev"
              onClick={() => {
                const el = scrollRef.current
                if (!el) return
                el.scrollBy({ left: -el.clientWidth * 0.8, behavior: 'smooth' })
              }}
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              type="button"
              className="star-items__control-btn star-items__control-btn--next"
              onClick={() => {
                const el = scrollRef.current
                if (!el) return
                el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' })
              }}
              aria-label="Next"
            >
              ›
            </button>
          </div>
        </div>
        <motion.p
          className="star-items__subhead"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          {t('starItems.subtitle')}
        </motion.p>

        {viewMode === 'grid' ? (
          <div className="star-items__slider">
            <motion.div
              ref={scrollRef}
              className="star-items__scroll"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
            >
              {starDishes.map((dish, index) => (
                <motion.div
                  key={dish.id}
                  className="star-items__card-wrap"
                  variants={item}
                >
                  <StarCard dish={dish} index={index} onSelect={() => openDishModal(dish)} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="star-items__list menu-grid--list">
            <div className="menu-grid__list">
              {starDishes.map((dish, index) => (
                <DishCard key={dish.id} dish={dish} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function StarCard({
  dish,
  index,
  onSelect,
}: {
  dish: Dish
  index: number
  onSelect: () => void
}) {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const isAr = language === 'ar'
  const name = isAr ? dish.nameAr : dish.nameEn
  const description = isAr ? dish.descriptionAr : dish.descriptionEn
  const priceLabel = dish.pricePerPiece
    ? t('dish.perPiece', { value: dish.price })
    : t('dish.price', { value: dish.price })

  return (
    <motion.article
      className="star-card"
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        type="button"
        className="star-card__trigger"
        onClick={onSelect}
        aria-label={t('dish.viewDetails')}
      >
        <div className="star-card__image-wrap">
          <img
            src={dish.image}
            alt=""
            className="star-card__image"
            loading={index < 4 ? 'eager' : 'lazy'}
            decoding="async"
          />
          <div className="star-card__overlay" aria-hidden="true" />
          {(dish.country || dish.countryFlagImage) && (
            <span
              className="star-card__country"
              title={dish.country ? t(`country.${dish.country}`, dish.country) : undefined}
              aria-label={dish.country ? t('dish.origin', { country: t(`country.${dish.country}`, dish.country) }) : undefined}
            >
              {dish.countryFlagImage ? (
                <img src={dish.countryFlagImage} alt="" className="star-card__country-img" />
              ) : (
                getCountryFlag(dish.country!)
              )}
            </span>
          )}
          {dish.isChefSpecialty && (
            <span className="star-card__badge" aria-hidden="true">
              {t('starItems.chefBadge')}
            </span>
          )}
          {dish.diet === 'vegetarian' && (
            <span className="star-card__diet" aria-hidden="true">V</span>
          )}
        </div>
        <div className="star-card__body">
          <h3 className="star-card__name">{name}</h3>
          <p className="star-card__desc">{description}</p>
      <DishTags tags={dish.tags} compact />
          <div className="star-card__meta">
            <span className="star-card__price">{priceLabel}</span>
            {dish.spiceLevel != null && (
              <SpiceLevel level={dish.spiceLevel} className="star-card__spice" />
            )}
            {dish.calories != null && (
              <span className="star-card__kcal">{t('dish.kcal', { value: dish.calories })}</span>
            )}
          </div>
        </div>
      </button>
    </motion.article>
  )
}

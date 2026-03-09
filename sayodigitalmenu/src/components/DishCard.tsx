import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { useMenu } from '../contexts/MenuContext'
import { getCountryFlag } from '../utils/countryFlag'
import { SpiceLevel } from './SpiceLevel'
import { DishTags } from './DishTags'
import type { Dish } from '../types/menu'
import './DishCard.css'

interface DishCardProps {
  dish: Dish
  index?: number
}

export function DishCard({ dish, index = 0 }: DishCardProps) {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { openDishModal } = useMenu()

  const isAr = language === 'ar'
  const name = isAr ? dish.nameAr : dish.nameEn
  const description = isAr ? dish.descriptionAr : dish.descriptionEn
  const priceLabel = dish.pricePerPiece
    ? t('dish.perPiece', { value: dish.price })
    : t('dish.price', { value: dish.price })

  return (
    <motion.article
      className="dish-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.03, 0.35),
        type: 'spring',
        stiffness: 260,
        damping: 24,
      }}
      whileHover={{
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        type="button"
        className="dish-card__trigger"
        onClick={() => openDishModal(dish)}
        aria-label={t('dish.viewDetails')}
      >
        <div className="dish-card__image-wrap">
          <img
            src={dish.image}
            alt=""
            className="dish-card__image"
            loading="lazy"
            decoding="async"
          />
          {(dish.country || dish.countryFlagImage) && (
            <span
              className="dish-card__country"
              title={dish.country ? t(`country.${dish.country}`, dish.country) : undefined}
              aria-label={dish.country ? t('dish.origin', { country: t(`country.${dish.country}`, dish.country) }) : undefined}
            >
              {dish.countryFlagImage ? (
                <img src={dish.countryFlagImage} alt="" className="dish-card__country-img" />
              ) : (
                getCountryFlag(dish.country!)
              )}
            </span>
          )}
          {(dish.isStar || dish.isChefSpecialty) && (
            <span className="dish-card__badge" aria-hidden="true">
              {dish.isChefSpecialty ? '★' : '☆'}
            </span>
          )}
          {dish.diet === 'vegetarian' && (
            <span className="dish-card__diet" aria-hidden="true">V</span>
          )}
        </div>
        <div className="dish-card__body">
          <h3 className="dish-card__name">{name}</h3>
          <p className="dish-card__desc">{description}</p>
          <DishTags tags={dish.tags} compact />
          <div className="dish-card__meta">
            <span className="dish-card__price">{priceLabel}</span>
            {dish.spiceLevel != null && (
              <SpiceLevel level={dish.spiceLevel} className="dish-card__spice" />
            )}
            {dish.calories != null && (
              <span className="dish-card__kcal">{t('dish.kcal', { value: dish.calories })}</span>
            )}
          </div>
        </div>
      </button>
    </motion.article>
  )
}

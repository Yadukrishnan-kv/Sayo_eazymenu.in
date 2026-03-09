import { useEffect, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { useMenu } from '../contexts/MenuContext'
import { SpiceLevel } from './SpiceLevel'
import { DishTags } from './DishTags'
import './DishModal.css'

const spring = { type: 'spring' as const, stiffness: 400, damping: 35 }

export function DishModal() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const {
    modalDish,
    closeDishModal,
    goToPrevDish,
    goToNextDish,
    filteredDishes,
  } = useMenu()
  const [imageIndex, setImageIndex] = useState(0)

  const isAr = language === 'ar'
  const currentIndex = modalDish
    ? filteredDishes.findIndex((d) => d.id === modalDish.id)
    : -1
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < filteredDishes.length - 1

  const images = modalDish
    ? (modalDish.images?.length ? modalDish.images : [modalDish.image])
    : []

  useEffect(() => {
    setImageIndex(0)
  }, [modalDish?.id])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!modalDish) return
      if (e.key === 'Escape') closeDishModal()
      if (e.key === 'ArrowLeft') (isAr ? goToNextDish : goToPrevDish)()
      if (e.key === 'ArrowRight') (isAr ? goToPrevDish : goToNextDish)()
    },
    [modalDish, closeDishModal, goToPrevDish, goToNextDish, isAr],
  )

  useEffect(() => {
    if (modalDish) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [modalDish, handleKeyDown])

  if (!modalDish) return null

  const name = isAr ? modalDish.nameAr : modalDish.nameEn
  const description = isAr ? modalDish.descriptionAr : modalDish.descriptionEn
  const priceLabel = modalDish.pricePerPiece
    ? t('dish.perPiece', { value: modalDish.price })
    : t('dish.price', { value: modalDish.price })

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="dish-modal__backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={closeDishModal}
        role="presentation"
        aria-hidden
      />
      <motion.dialog
        open
        className="dish-modal dish-modal--glass"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={spring}
        aria-modal="true"
        aria-labelledby="dish-modal-title"
        aria-describedby="dish-modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className="dish-modal__inner"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={{ left: 0, right: 0.2 }}
          onDragEnd={(_, info) => {
            if (info.offset.x > 100 || info.velocity.x > 400) {
              closeDishModal()
            }
          }}
        >
          <button
            type="button"
            className="dish-modal__close"
            onClick={closeDishModal}
            aria-label={t('modal.close')}
          >
            <span aria-hidden="true">×</span>
          </button>

          <div className="dish-modal__media">
            <div className="dish-modal__carousel">
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="dish-modal__img-nav dish-modal__img-nav--prev"
                    onClick={() => setImageIndex((i) => (i <= 0 ? images.length - 1 : i - 1))}
                    aria-label={t('modal.previous')}
                  >
                    <span aria-hidden>{isAr ? '→' : '←'}</span>
                  </button>
                  <button
                    type="button"
                    className="dish-modal__img-nav dish-modal__img-nav--next"
                    onClick={() => setImageIndex((i) => (i >= images.length - 1 ? 0 : i + 1))}
                    aria-label={t('modal.next')}
                  >
                    <span aria-hidden>{isAr ? '←' : '→'}</span>
                  </button>
                </>
              )}
              <img
                key={images[imageIndex]}
                src={images[imageIndex]}
                alt=""
                className="dish-modal__carousel-img"
              />
            </div>
            {images.length > 1 && (
              <div className="dish-modal__carousel-dots">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`dish-modal__carousel-dot ${i === imageIndex ? 'dish-modal__carousel-dot--active' : ''}`}
                    onClick={() => setImageIndex(i)}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            )}
            {(modalDish.isStar || modalDish.isChefSpecialty) && (
              <span className="dish-modal__badge">
                {modalDish.isChefSpecialty ? `★ ${t('starItems.chefBadge')}` : '☆ Star'}
              </span>
            )}
          </div>

          <div className="dish-modal__content">
            <h2 id="dish-modal-title" className="dish-modal__title">
              {name}
            </h2>
            <p id="dish-modal-desc" className="dish-modal__desc">
              {description}
            </p>
            <DishTags tags={modalDish.tags} />
            {modalDish.ingredients && modalDish.ingredients.length > 0 && (
              <p className="dish-modal__ingredients">
                <strong>{t('dish.ingredients')}:</strong> {modalDish.ingredients.join(', ')}
              </p>
            )}
            <div className="dish-modal__meta">
              <span className="dish-modal__price">{priceLabel}</span>
              {modalDish.spiceLevel != null && (
                <SpiceLevel level={modalDish.spiceLevel} className="dish-modal__spice" />
              )}
              {modalDish.calories != null && (
                <span className="dish-modal__kcal">{t('dish.kcal', { value: modalDish.calories })}</span>
              )}
            </div>
          </div>

          {filteredDishes.length > 1 && (
            <>
              <button
                type="button"
                className="dish-modal__nav dish-modal__nav--prev"
                onClick={goToPrevDish}
                disabled={!hasPrev}
                aria-label={t('modal.previous')}
              >
                <span aria-hidden="true">{isAr ? '→' : '←'}</span>
              </button>
              <button
                type="button"
                className="dish-modal__nav dish-modal__nav--next"
                onClick={goToNextDish}
                disabled={!hasNext}
                aria-label={t('modal.next')}
              >
                <span aria-hidden="true">{isAr ? '←' : '→'}</span>
              </button>
            </>
          )}
        </motion.div>
      </motion.dialog>
    </AnimatePresence>
  )
}

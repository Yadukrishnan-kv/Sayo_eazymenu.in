import { useLanguage } from '../contexts/LanguageContext'
import type { Dish } from '../types/menu'
import { getTagIconForDishTag } from '../lib/tagIcons'
import './DishTags.css'

interface DishTagsProps {
  tags?: Dish['tags']
  /** Compact pills for tight layouts like cards */
  compact?: boolean
}

export function DishTags({ tags, compact = false }: DishTagsProps) {
  const { language } = useLanguage()
  if (!tags || tags.length === 0) return null

  const isAr = language === 'ar'

  return (
    <div className={compact ? 'dish-tags dish-tags--compact' : 'dish-tags'}>
      {tags.map((tag) => {
        if (!tag) return null
        const Icon = getTagIconForDishTag(tag)
        const label = isAr && tag.nameAr ? tag.nameAr : tag.name
        return (
          <span key={tag.id} className="dish-tag-pill" aria-label={label} title={label}>
            <Icon className="dish-tag-pill__icon" aria-hidden="true" />
            {!compact && (
              <span className="dish-tag-pill__label">
                {label}
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}


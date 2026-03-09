import { useTranslation } from 'react-i18next'
import type { Dish } from '../types/menu'
import './SpiceLevel.css'

interface SpiceLevelProps {
  level: Dish['spiceLevel']
  className?: string
}

const MAX_LEVEL = 4

export function SpiceLevel({ level, className = '' }: SpiceLevelProps) {
  const { t } = useTranslation()

  if (level == null || level < 0) return null

  const clamped = Math.min(level, MAX_LEVEL)
  const label = t(`spice.level${clamped}` as 'spice.level0')
  const ariaLabel = t('spice.label') + ': ' + label

  return (
    <span
      className={`spice-level ${className}`.trim()}
      title={label}
      aria-label={ariaLabel}
    >
      <span className="spice-level__icon" aria-hidden="true">🌶</span>
      <span className="spice-level__chilis" aria-hidden="true">
        {Array.from({ length: MAX_LEVEL }, (_, i) => (
          <span
            key={i}
            className={`spice-level__chili ${i < clamped ? `spice-level__chili--on spice-level__chili--n${i + 1}` : ''}`}
          />
        ))}
      </span>
    </span>
  )
}

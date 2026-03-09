import {
  Leaf,
  Flame,
  Sprout,
  Wheat,
  Milk,
  Beef,
  Baby,
  Citrus,
  Fish,
  Tag as TagGlyph,
} from 'lucide-react'
import type { DishTag } from '../types/menu'

/** Maps icon keys to Lucide components for tag display */
export const TAG_ICON_MAP = {
  leaf: Leaf,
  vegetarian: Leaf,
  vegan: Sprout,
  spicy: Flame,
  gluten: Wheat,
  dairy: Milk,
  dairyFree: Milk,
  meat: Beef,
  kids: Baby,
  halal: Beef,
  citrus: Citrus,
  fish: Fish,
  default: TagGlyph,
} as const

/** Slug-based fallback when tag has no icon set */
const SLUG_TO_ICON: Record<string, keyof typeof TAG_ICON_MAP> = {
  vegetarian: 'leaf',
  vegan: 'vegan',
  spicy: 'spicy',
  'gluten-free': 'gluten',
  dairy: 'dairy',
  halal: 'meat',
  kids: 'kids',
  fish: 'fish',
}

export function getTagIconForDishTag(tag: DishTag) {
  const slugKey = tag.slug?.toLowerCase() ?? ''
  const explicitKey = (tag.icon as keyof typeof TAG_ICON_MAP | undefined) ?? undefined
  const resolvedKey: keyof typeof TAG_ICON_MAP =
    explicitKey && TAG_ICON_MAP[explicitKey]
      ? explicitKey
      : SLUG_TO_ICON[slugKey] || 'default'

  return TAG_ICON_MAP[resolvedKey] || TAG_ICON_MAP.default
}


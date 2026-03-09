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
  Tag,
} from 'lucide-react';

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
  default: Tag,
};

/** Icon options for tag creation (key, label, component) */
export const TAG_ICON_OPTIONS = [
  { key: 'leaf', label: 'Vegetarian', Icon: Leaf },
  { key: 'spicy', label: 'Spicy', Icon: Flame },
  { key: 'vegan', label: 'Vegan', Icon: Sprout },
  { key: 'gluten', label: 'Gluten-free', Icon: Wheat },
  { key: 'dairy', label: 'Dairy', Icon: Milk },
  { key: 'meat', label: 'Meat / Halal', Icon: Beef },
  { key: 'kids', label: 'Kids', Icon: Baby },
  { key: 'fish', label: 'Fish', Icon: Fish },
  { key: 'citrus', label: 'Citrus', Icon: Citrus },
  { key: 'default', label: 'Default', Icon: Tag },
];

/** Slug-based fallback when tag has no icon set */
const SLUG_TO_ICON = {
  vegetarian: 'leaf',
  vegan: 'vegan',
  spicy: 'spicy',
  'gluten-free': 'gluten',
  dairy: 'dairy',
  halal: 'meat',
  kids: 'kids',
  fish: 'fish',
};

export function getTagIcon(tag) {
  const key = tag?.icon || SLUG_TO_ICON[tag?.slug?.toLowerCase()] || 'default';
  return TAG_ICON_MAP[key] || TAG_ICON_MAP.default;
}

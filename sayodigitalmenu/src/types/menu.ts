export type Diet = 'vegetarian' | 'non-vegetarian' | 'all'
export type PriceRange = 'all' | 'under30' | 'under50' | 'under100' | 'over100'

export interface DishTag {
  id: string
  name: string
  nameAr?: string
  slug?: string
  color?: string
  icon?: string
}

export interface Dish {
  id: string
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  category: string
  /** Arabic name of the classification (category) from admin. */
  categoryAr?: string
  categoryKey: string
  price: number
  pricePerPiece?: number
  image: string
  images?: string[]
  diet: 'vegetarian' | 'non-vegetarian'
  calories?: number
  isStar?: boolean
  isChefSpecialty?: boolean
  popularity?: number
  ingredients?: string[]
  allergens?: string[]
  /** ISO 3166-1 alpha-2 country code for dish origin (e.g. JP, TH, IN). */
  country?: string
  /** Optional flag image URL (or data URL) from Countries master; shown instead of emoji when set. */
  countryFlagImage?: string
  /** Spice level 0–4: 0 = not spicy, 4 = very hot. */
  spiceLevel?: number
  /** Top-level menu: food, kids, or beverages (used for Show all / Food / Kids / Beverages nav). */
  menuGroup?: 'food' | 'kids' | 'beverages'
  /** Visual tags like Vegetarian, Spicy, Kids, etc. */
  tags?: DishTag[]
}

export interface MenuFilters {
  category: string
  subcategory: string
  diet: Diet
  priceRange: PriceRange
  priceMin?: number
  priceMax?: number
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'popularity'
  chefSpecialOnly: boolean
}

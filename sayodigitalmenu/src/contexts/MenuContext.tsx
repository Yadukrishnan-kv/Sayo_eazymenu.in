import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Dish, MenuFilters, Diet, PriceRange } from '../types/menu'
import { menuDishes } from '../data/menuData'
import { API_BASE } from '../api/config'

export type ViewMode = 'grid' | 'list'

interface MenuContextValue {
  /** True until the first public menu fetch completes (success or error). */
  menuLoading: boolean
  dishes: Dish[]
  filteredDishes: Dish[]
  filters: MenuFilters
  /** Classifications (categories) for the left filter; names from admin (EN/AR). */
  availableSubcategories: { key: string; nameEn: string; nameAr: string }[]
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  setCategory: (category: string) => void
  setSubcategory: (subcategory: string) => void
  setDiet: (diet: Diet) => void
  setPriceRange: (range: PriceRange) => void
  setSortBy: (sort: MenuFilters['sortBy']) => void
  clearFilters: () => void
  setChefSpecialOnly: (value: boolean) => void
  openDishModal: (dish: Dish) => void
  closeDishModal: () => void
  modalDish: Dish | null
  setModalDish: (dish: Dish | null) => void
  goToPrevDish: () => void
  goToNextDish: () => void
}

const defaultFilters: MenuFilters = {
  category: 'all',
  subcategory: 'all',
  diet: 'all',
  priceRange: 'all',
  sortBy: 'default',
  chefSpecialOnly: false,
}

const MenuContext = createContext<MenuContextValue | null>(null)
const VIEW_MODE_KEY = 'sayo-view-mode'

const categoryOrder = [
  'appetizers', 'soups', 'salads', 'sushi', 'dimSum', 'robata', 'mains', 'indian', 'desserts', 'drinks', 'combos',
] as const

function getDishesForMenu(dishes: Dish[], menuCategory: string): Dish[] {
  if (menuCategory === 'all') return dishes
  if (menuCategory === 'food') return dishes.filter((d) => d.categoryKey !== 'drinks')
  if (menuCategory === 'beverages') return dishes.filter((d) => d.categoryKey === 'drinks')
  if (menuCategory === 'kids') return dishes.filter((d) => d.menuGroup === 'kids')
  return dishes
}

function getAvailableSubcategories(dishes: Dish[], menuCategory: string): { key: string; nameEn: string; nameAr: string }[] {
  const menuDishes = getDishesForMenu(dishes, menuCategory)
  const keyToNames = new Map<string, { nameEn: string; nameAr: string }>()
  for (const d of menuDishes) {
    if (!keyToNames.has(d.categoryKey)) {
      keyToNames.set(d.categoryKey, {
        nameEn: d.category || d.categoryKey,
        nameAr: d.categoryAr || d.category || d.categoryKey,
      })
    }
  }
  const keys = new Set(keyToNames.keys())
  const ordered = categoryOrder.filter((k) => keys.has(k))
  const extra = [...keys].filter((k) => !categoryOrder.includes(k as any))
  return [...ordered, ...extra].map((key) => {
    const { nameEn, nameAr } = keyToNames.get(key) || { nameEn: key, nameAr: key }
    return { key, nameEn, nameAr }
  })
}

function filterAndSort(
  dishes: Dish[],
  filters: MenuFilters,
): Dish[] {
  let result = getDishesForMenu(dishes, filters.category)

  if (filters.subcategory !== 'all') {
    result = result.filter((d) => d.categoryKey === filters.subcategory)
  }

  if (filters.chefSpecialOnly) {
    result = result.filter((d) => d.isChefSpecialty)
  }

  if (filters.diet === 'vegetarian') {
    result = result.filter((d) => d.diet === 'vegetarian')
  } else if (filters.diet === 'non-vegetarian') {
    result = result.filter((d) => d.diet === 'non-vegetarian')
  }

  if (filters.priceRange !== 'all') {
    const limits = {
      under30: 30,
      under50: 50,
      under100: 100,
      over100: Infinity,
    }
    const limit = limits[filters.priceRange]
    if (filters.priceRange === 'over100') {
      result = result.filter((d) => d.price >= 100)
    } else {
      result = result.filter((d) => d.price <= limit)
    }
  }

  if (filters.sortBy === 'price-asc') {
    result.sort((a, b) => a.price - b.price)
  } else if (filters.sortBy === 'price-desc') {
    result.sort((a, b) => b.price - a.price)
  } else if (filters.sortBy === 'popularity') {
    result.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
  }
  // For the default sort, we intentionally keep the order
  // provided by the backend, which already respects:
  // main section order → classification order → menu item order.

  return result
}

function getInitialViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'grid'
  try {
    const stored = localStorage.getItem(VIEW_MODE_KEY)
    if (stored === 'list' || stored === 'grid') return stored
  } catch {
    /* ignore */
  }
  return window.matchMedia('(max-width: 900px)').matches ? 'list' : 'grid'
}

function normalizeDish(raw: Record<string, unknown>): Dish {
  return {
    id: String(raw.id ?? ''),
    nameEn: String(raw.nameEn ?? ''),
    nameAr: String(raw.nameAr ?? raw.nameEn ?? ''),
    descriptionEn: String(raw.descriptionEn ?? ''),
    descriptionAr: String(raw.descriptionAr ?? ''),
    category: String(raw.category ?? ''),
    categoryAr: raw.categoryAr != null ? String(raw.categoryAr) : undefined,
    categoryKey: String(raw.categoryKey ?? ''),
    price: Number(raw.price ?? 0),
    pricePerPiece: raw.pricePerPiece != null ? Number(raw.pricePerPiece) : undefined,
    image: String(raw.image ?? (Array.isArray(raw.images) && raw.images[0]) ?? ''),
    images: Array.isArray(raw.images) && raw.images.length > 0 ? raw.images.map(String) : undefined,
    diet: raw.diet === 'vegetarian' ? 'vegetarian' : 'non-vegetarian',
    calories: raw.calories != null ? Number(raw.calories) : undefined,
    isStar: Boolean(raw.isStar),
    isChefSpecialty: Boolean(raw.isChefSpecialty),
    popularity: raw.popularity != null ? Number(raw.popularity) : undefined,
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients.map(String) : undefined,
    allergens: Array.isArray(raw.allergens) ? raw.allergens.map(String) : undefined,
    country: raw.country != null ? String(raw.country) : undefined,
    countryFlagImage: raw.countryFlagImage != null ? String(raw.countryFlagImage) : undefined,
    spiceLevel: raw.spiceLevel != null ? Number(raw.spiceLevel) : undefined,
    menuGroup: raw.menuGroup === 'kids' || raw.menuGroup === 'beverages' ? raw.menuGroup : 'food',
    tags: Array.isArray((raw as any).tags)
      ? ((raw as any).tags as any[])
          .map((tag: any) => {
            const id = tag.id ?? tag._id
            if (!id) return null
            return {
              id: String(id),
              name: String(tag.name ?? ''),
              nameAr: tag.nameAr != null ? String(tag.nameAr) : undefined,
              slug: tag.slug != null ? String(tag.slug) : undefined,
              color: tag.color != null ? String(tag.color) : undefined,
              icon: tag.icon != null ? String(tag.icon) : undefined,
            }
          })
          .filter(Boolean)
      : undefined,
  }
}

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [menuLoading, setMenuLoading] = useState(true)
  const [filters, setFilters] = useState<MenuFilters>(defaultFilters)
  const [viewMode, setViewModeState] = useState<ViewMode>(getInitialViewMode)
  const [modalDish, setModalDish] = useState<Dish | null>(null)

  useEffect(() => {
    let cancelled = false
    setMenuLoading(true)
    const apiUrl = `${API_BASE}/api/public/menu`
    const fallbackUrl = 'http://localhost:5000/api/public/menu'

    function handleData(data: unknown) {
      if (cancelled) return
      const list = Array.isArray(data) ? data : []
      setDishes(list.map((item) => normalizeDish(item as Record<string, unknown>)))
    }

    function tryFetch(url: string): Promise<unknown> {
      return fetch(url)
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load menu'))))
    }

    tryFetch(apiUrl)
      .then(handleData)
      .catch(() => {
        if (cancelled) return
        if (apiUrl !== fallbackUrl) {
          return tryFetch(fallbackUrl).then(handleData)
        }
        return Promise.reject()
      })
      .catch(() => {
        if (!cancelled) setDishes(menuDishes)
      })
      .finally(() => {
        if (!cancelled) setMenuLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode)
    try {
      localStorage.setItem(VIEW_MODE_KEY, mode)
    } catch {
      /* ignore */
    }
  }, [])

  // Correct default on mobile when no stored preference – viewport can be wrong on initial load
  useEffect(() => {
    const applyMobileDefault = () => {
      try {
        if (localStorage.getItem(VIEW_MODE_KEY)) return
      } catch {
        return
      }
      if (window.matchMedia('(max-width: 900px)').matches) {
        setViewModeState('list')
      }
    }
    applyMobileDefault()
    const t = setTimeout(applyMobileDefault, 250)
    return () => clearTimeout(t)
  }, [])

  const setCategory = useCallback((category: string) => {
    setFilters((f) => ({ ...f, category, subcategory: 'all' }))
  }, [])

  const setSubcategory = useCallback((subcategory: string) => {
    setFilters((f) => ({ ...f, subcategory }))
  }, [])

  const setDiet = useCallback((diet: Diet) => {
    setFilters((f) => ({ ...f, diet }))
  }, [])

  const setPriceRange = useCallback((range: PriceRange) => {
    setFilters((f) => ({ ...f, priceRange: range }))
  }, [])

  const setSortBy = useCallback((sortBy: MenuFilters['sortBy']) => {
    setFilters((f) => ({ ...f, sortBy }))
  }, [])

  const setChefSpecialOnly = useCallback((chefSpecialOnly: boolean) => {
    setFilters((f) => ({ ...f, chefSpecialOnly }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const openDishModal = useCallback((dish: Dish) => {
    setModalDish(dish)
  }, [])

  const closeDishModal = useCallback(() => {
    setModalDish(null)
  }, [])

  const sourceDishes = menuLoading ? [] : (dishes.length > 0 ? dishes : menuDishes)

  const filteredDishes = useMemo(() => {
    return filterAndSort(sourceDishes, filters)
  }, [sourceDishes, filters])

  const availableSubcategories = useMemo(() => {
    return getAvailableSubcategories(sourceDishes, filters.category)
  }, [sourceDishes, filters.category])

  const goToPrevDish = useCallback(() => {
    if (!modalDish) return
    const idx = filteredDishes.findIndex((d) => d.id === modalDish.id)
    if (idx > 0) setModalDish(filteredDishes[idx - 1])
  }, [modalDish, filteredDishes])

  const goToNextDish = useCallback(() => {
    if (!modalDish) return
    const idx = filteredDishes.findIndex((d) => d.id === modalDish.id)
    if (idx >= 0 && idx < filteredDishes.length - 1) {
      setModalDish(filteredDishes[idx + 1])
    }
  }, [modalDish, filteredDishes])

  const value: MenuContextValue = useMemo(
    () => ({
      menuLoading,
      dishes: sourceDishes,
      filteredDishes,
      filters,
      availableSubcategories,
      viewMode,
      setViewMode,
      setCategory,
      setSubcategory,
      setDiet,
      setPriceRange,
      setSortBy,
      clearFilters,
      setChefSpecialOnly,
      openDishModal,
      closeDishModal,
      modalDish,
      setModalDish,
      goToPrevDish,
      goToNextDish,
    }),
    [
      menuLoading,
      sourceDishes,
      filteredDishes,
      filters,
      availableSubcategories,
      viewMode,
      setCategory,
      setSubcategory,
      setDiet,
      setPriceRange,
      setSortBy,
      clearFilters,
      setChefSpecialOnly,
      openDishModal,
      closeDishModal,
      modalDish,
      goToPrevDish,
      goToNextDish,
    ],
  )

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function useMenu() {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error('useMenu must be used within MenuProvider')
  return ctx
}

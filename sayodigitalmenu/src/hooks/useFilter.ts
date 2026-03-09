import { useMenu } from '../contexts/MenuContext'

/**
 * Thin wrapper around MenuContext for filter state and actions.
 * Use when you need only filter-related API without modal or dishes.
 */
export function useFilter() {
  const {
    filters,
    filteredDishes,
    setCategory,
    setDiet,
    setPriceRange,
    setSortBy,
    setChefSpecialOnly,
    clearFilters,
  } = useMenu()
  return {
    filters,
    filteredDishes,
    setCategory,
    setDiet,
    setPriceRange,
    setSortBy,
    setChefSpecialOnly,
    clearFilters,
  }
}

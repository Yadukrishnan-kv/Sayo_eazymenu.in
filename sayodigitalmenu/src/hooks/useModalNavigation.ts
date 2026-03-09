import { useMenu } from '../contexts/MenuContext'

/**
 * Hook for dish modal open/close and prev/next navigation.
 */
export function useModalNavigation() {
  const {
    modalDish,
    openDishModal,
    closeDishModal,
    setModalDish,
    goToPrevDish,
    goToNextDish,
    filteredDishes,
  } = useMenu()
  return {
    modalDish,
    openDishModal,
    closeDishModal,
    setModalDish,
    goToPrevDish,
    goToNextDish,
    filteredDishes,
  }
}

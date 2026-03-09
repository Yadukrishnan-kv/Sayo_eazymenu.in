import { configureStore } from '@reduxjs/toolkit';
import mainSectionsReducer from './slices/mainSectionsSlice';
import classificationsReducer from './slices/classificationsSlice';
import menuItemsReducer from './slices/menuItemsSlice';
import tagsReducer from './slices/tagsSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    mainSections: mainSectionsReducer,
    classifications: classificationsReducer,
    menuItems: menuItemsReducer,
    tags: tagsReducer,
    settings: settingsReducer,
  },
});

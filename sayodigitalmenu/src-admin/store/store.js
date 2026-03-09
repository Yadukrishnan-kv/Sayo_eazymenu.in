import { configureStore } from '@reduxjs/toolkit';
import mainSectionsReducer from './slices/mainSectionsSlice';
import classificationsReducer from './slices/classificationsSlice';
import menuItemsReducer from './slices/menuItemsSlice';
import tagsReducer from './slices/tagsSlice';
import countriesReducer from './slices/countriesSlice';
import settingsReducer from './slices/settingsSlice';
import rolesReducer from './slices/rolesSlice';
import usersReducer from './slices/usersSlice';
import customersReducer from './slices/customersSlice';

export const store = configureStore({
  reducer: {
    mainSections: mainSectionsReducer,
    classifications: classificationsReducer,
    menuItems: menuItemsReducer,
    tags: tagsReducer,
    countries: countriesReducer,
    settings: settingsReducer,
    roles: rolesReducer,
    users: usersReducer,
    customers: customersReducer,
  },
});

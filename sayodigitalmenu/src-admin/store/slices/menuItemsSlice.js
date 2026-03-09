import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api/api';

export const fetchMenuItems = createAsyncThunk('menuItems/fetchAll', () => api.menuItems.getAll());
export const createMenuItem = createAsyncThunk('menuItems/create', (data) => api.menuItems.create(data));
export const updateMenuItem = createAsyncThunk('menuItems/update', ({ id, updates }) => api.menuItems.update(id, updates));
export const deleteMenuItem = createAsyncThunk('menuItems/delete', (id) => api.menuItems.delete(id));
export const reorderMenuItems = createAsyncThunk('menuItems/reorder', ({ classificationId, orderedIds }) =>
  api.menuItems.reorder(classificationId, orderedIds)
);

const menuItemsSlice = createSlice({
  name: 'menuItems',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItems.fulfilled, (state, { payload }) => {
        state.items = payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchMenuItems.pending, (state) => { state.loading = true; })
      .addCase(fetchMenuItems.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
      })
      .addCase(createMenuItem.fulfilled, (state, { payload }) => {
        state.items.push(payload);
      })
      .addCase(updateMenuItem.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((i) => i.id === payload.id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(deleteMenuItem.fulfilled, (state, { meta }) => {
        state.items = state.items.filter((i) => i.id !== meta.arg);
      })
      .addCase(reorderMenuItems.fulfilled, (state, { payload }) => {
        state.items = payload;
      });
  },
});

export default menuItemsSlice.reducer;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { mockApi } from '../../api/mockApi';

export const fetchMainSections = createAsyncThunk('mainSections/fetchAll', () => mockApi.mainSections.getAll());
export const createMainSection = createAsyncThunk('mainSections/create', (data) => mockApi.mainSections.create(data));
export const updateMainSection = createAsyncThunk('mainSections/update', ({ id, updates }) => mockApi.mainSections.update(id, updates));
export const deleteMainSection = createAsyncThunk('mainSections/delete', (id) => mockApi.mainSections.delete(id));

const mainSectionsSlice = createSlice({
  name: 'mainSections',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMainSections.fulfilled, (state, { payload }) => {
        state.items = payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchMainSections.pending, (state) => { state.loading = true; })
      .addCase(fetchMainSections.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
      })
      .addCase(createMainSection.fulfilled, (state, { payload }) => {
        state.items.push(payload);
      })
      .addCase(updateMainSection.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((s) => s.id === payload.id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(deleteMainSection.fulfilled, (state, { meta }) => {
        state.items = state.items.filter((s) => s.id !== meta.arg);
      });
  },
});

export default mainSectionsSlice.reducer;

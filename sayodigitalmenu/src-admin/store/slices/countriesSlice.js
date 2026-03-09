import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api/api';

export const fetchCountries = createAsyncThunk('countries/fetchAll', () => api.countries.getAll());
export const createCountry = createAsyncThunk('countries/create', (data) => api.countries.create(data));
export const updateCountry = createAsyncThunk('countries/update', ({ id, updates }) => api.countries.update(id, updates));
export const deleteCountry = createAsyncThunk('countries/delete', (id) => api.countries.delete(id));

const countriesSlice = createSlice({
  name: 'countries',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.fulfilled, (state, { payload }) => {
        state.items = payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCountries.pending, (state) => { state.loading = true; })
      .addCase(fetchCountries.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error?.message;
      })
      .addCase(createCountry.fulfilled, (state, { payload }) => {
        state.items.push(payload);
      })
      .addCase(updateCountry.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((c) => c.id === payload.id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(deleteCountry.fulfilled, (state, { meta }) => {
        state.items = state.items.filter((c) => c.id !== meta.arg);
      });
  },
});

export default countriesSlice.reducer;

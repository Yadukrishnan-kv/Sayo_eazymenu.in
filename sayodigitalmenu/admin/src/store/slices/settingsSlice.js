import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { mockApi } from '../../api/mockApi';

export const fetchSettings = createAsyncThunk('settings/fetch', () => mockApi.settings.get());
export const updateSettings = createAsyncThunk('settings/update', (updates) => mockApi.settings.update(updates));

const settingsSlice = createSlice({
  name: 'settings',
  initialState: { data: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.fulfilled, (state, { payload }) => {
        state.data = payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchSettings.pending, (state) => { state.loading = true; })
      .addCase(fetchSettings.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
      })
      .addCase(updateSettings.fulfilled, (state, { payload }) => {
        state.data = payload;
      });
  },
});

export default settingsSlice.reducer;

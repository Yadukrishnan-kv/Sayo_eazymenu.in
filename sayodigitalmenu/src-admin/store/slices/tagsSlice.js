import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api/api';

export const fetchTags = createAsyncThunk('tags/fetchAll', () => api.tags.getAll());
export const createTag = createAsyncThunk('tags/create', (data) => api.tags.create(data));
export const updateTag = createAsyncThunk('tags/update', ({ id, updates }) => api.tags.update(id, updates));
export const deleteTag = createAsyncThunk('tags/delete', (id) => api.tags.delete(id));

const tagsSlice = createSlice({
  name: 'tags',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.fulfilled, (state, { payload }) => {
        state.items = payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchTags.pending, (state) => { state.loading = true; })
      .addCase(fetchTags.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
      })
      .addCase(createTag.fulfilled, (state, { payload }) => {
        state.items.push(payload);
      })
      .addCase(updateTag.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((t) => t.id === payload.id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(deleteTag.fulfilled, (state, { meta }) => {
        state.items = state.items.filter((t) => t.id !== meta.arg);
      });
  },
});

export default tagsSlice.reducer;

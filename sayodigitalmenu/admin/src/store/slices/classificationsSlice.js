import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { mockApi } from '../../api/mockApi';

export const fetchClassifications = createAsyncThunk('classifications/fetchAll', () => mockApi.classifications.getAll());
export const createClassification = createAsyncThunk('classifications/create', (data) => mockApi.classifications.create(data));
export const updateClassification = createAsyncThunk('classifications/update', ({ id, updates }) => mockApi.classifications.update(id, updates));
export const deleteClassification = createAsyncThunk('classifications/delete', (id) => mockApi.classifications.delete(id));
export const reorderClassifications = createAsyncThunk('classifications/reorder', ({ mainSectionId, orderedIds }) =>
  mockApi.classifications.reorder(mainSectionId, orderedIds)
);

const classificationsSlice = createSlice({
  name: 'classifications',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClassifications.fulfilled, (state, { payload }) => {
        state.items = payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchClassifications.pending, (state) => { state.loading = true; })
      .addCase(fetchClassifications.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
      })
      .addCase(createClassification.fulfilled, (state, { payload }) => {
        state.items.push(payload);
      })
      .addCase(updateClassification.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((c) => c.id === payload.id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(deleteClassification.fulfilled, (state, { meta }) => {
        state.items = state.items.filter((c) => c.id !== meta.arg);
      })
      .addCase(reorderClassifications.fulfilled, (state, { payload }) => {
        state.items = payload;
      });
  },
});

export default classificationsSlice.reducer;

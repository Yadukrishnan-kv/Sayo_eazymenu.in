import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api/api';

export const fetchRoles = createAsyncThunk('roles/fetchAll', () => api.roles.getAll());
export const createRole = createAsyncThunk('roles/create', (data) => api.roles.create(data));
export const updateRole = createAsyncThunk('roles/update', ({ id, updates }) => api.roles.update(id, updates));
export const deleteRole = createAsyncThunk('roles/delete', (id) => api.roles.delete(id));

const rolesSlice = createSlice({
  name: 'roles',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.fulfilled, (state, { payload }) => {
        state.items = payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchRoles.pending, (state) => { state.loading = true; })
      .addCase(fetchRoles.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
      })
      .addCase(createRole.fulfilled, (state, { payload }) => { state.items.push(payload); })
      .addCase(updateRole.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((r) => r.id === payload.id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(deleteRole.fulfilled, (state, { meta }) => {
        state.items = state.items.filter((r) => r.id !== meta.arg);
      });
  },
});

export default rolesSlice.reducer;

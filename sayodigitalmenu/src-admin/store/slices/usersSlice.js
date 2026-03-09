import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api/api';

export const fetchUsers = createAsyncThunk('users/fetchAll', () => api.users.getAll());
export const createUser = createAsyncThunk('users/create', (data) => api.users.create(data));
export const updateUser = createAsyncThunk('users/update', ({ id, updates }) => api.users.update(id, updates));
export const deleteUser = createAsyncThunk('users/delete', (id) => api.users.delete(id));

const usersSlice = createSlice({
  name: 'users',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, { payload }) => {
        state.items = payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchUsers.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
      })
      .addCase(createUser.fulfilled, (state, { payload }) => {
        state.items.push(payload);
      })
      .addCase(updateUser.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((u) => u.id === payload.id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(deleteUser.fulfilled, (state, { meta }) => {
        state.items = state.items.filter((u) => u.id !== meta.arg);
      });
  },
});

export default usersSlice.reducer;

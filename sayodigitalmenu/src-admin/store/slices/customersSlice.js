import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api/api';

export const fetchCustomers = createAsyncThunk('customers/fetchAll', () => api.customers.getAll());
export const deleteCustomer = createAsyncThunk('customers/delete', (id) => api.customers.delete(id));

const customersSlice = createSlice({
  name: 'customers',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.fulfilled, (state, { payload }) => {
        state.items = payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomers.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
      })
      .addCase(deleteCustomer.fulfilled, (state, { meta }) => {
        state.items = state.items.filter((c) => c.id !== meta.arg);
      });
  },
});

export default customersSlice.reducer;


import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AllDistributorList } from "../api/api";

// Define the initial state
const initialState = {
  distributors: [],
  loading: false,
  error: null,
};

// Create an async thunk to fetch distributor data
export const fetchDistributors = createAsyncThunk(
  "distributors/fetchDistributors",
  async (params = {}, { rejectWithValue }) => {
    try {
      // params: { sortBy, sortOrder } — both optional. Called with no
      // args (fetchDistributors()) still works exactly as before.
      let res = await AllDistributorList(params);
      return res?.data?.data || [];
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Create the slice
const distributorListSlice = createSlice({
  name: "distributors",
  initialState,
  reducers: {
    // You can add synchronous actions if needed
    getDistributors: (state) => {
      state.loading = true;
    },
    getDistributorsSuccess: (state, action) => {
      state.distributors = action.payload;
      state.loading = false;
      state.error = null;
    },
    getDistributorsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDistributors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDistributors.fulfilled, (state, action) => {
        state.distributors = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchDistributors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const {
  getDistributors,
  getDistributorsSuccess,
  getDistributorsFailure,
} = distributorListSlice.actions;
export default distributorListSlice.reducer;

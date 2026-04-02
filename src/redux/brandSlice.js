import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AllBrandList } from "../api/api";

const initialState = {
  brands: [],
  loading: false,
  error: null,
};

export const fetchBrands = createAsyncThunk(
  "brand/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      let res = await AllBrandList();
      return res?.data?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const brandSlice = createSlice({
  name: "brand",
  initialState,
  reducers: {
    getBrands: (state) => {
      state.loading = true;
    },
    getBrandsSuccess: (state, action) => {
      state.brands = action.payload;
      state.loading = false;
      state.error = null;
    },
    getBrandsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { getBrands, getBrandsSuccess, getBrandsFailure } =
  brandSlice.actions;

export default brandSlice.reducer;

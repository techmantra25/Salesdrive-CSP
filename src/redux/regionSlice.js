import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AllRegionList } from "../api/api";

const initialState = {
  regions: [],
  loading: false,
  error: null,
};

export const fetchRegions = createAsyncThunk(
  "region/fetchRegions",
  async (_, { rejectWithValue }) => {
    try {
      let res = await AllRegionList();
      return res?.data?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const regionSlice = createSlice({
  name: "region",
  initialState,
  reducers: {
    getRegions: (state) => {
      state.loading = true;
    },
    getRegionsSuccess: (state, action) => {
      state.regions = action.payload;
      state.loading = false;
      state.error = null;
    },
    getRegionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRegions.fulfilled, (state, action) => {
        state.regions = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { getRegions, getRegionsSuccess, getRegionsFailure } =
  regionSlice.actions;

export default regionSlice.reducer;

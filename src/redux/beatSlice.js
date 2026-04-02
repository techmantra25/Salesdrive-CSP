import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getBeats } from "../api/api";

export const fetchBeats = createAsyncThunk(
  "beat/fetchBeats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getBeats();
      return response?.data?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const beatSlice = createSlice({
  name: "beat",
  initialState: {
    beats: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBeats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBeats.fulfilled, (state, action) => {
        state.beats = action.payload;
        state.loading = false;
      })
      .addCase(fetchBeats.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export default beatSlice.reducer;

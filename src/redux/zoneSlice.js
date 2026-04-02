import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AllZoneList } from "../api/api";

const initialState = {
  zones: [],
  loading: false,
  error: null,
};

export const fetchZones = createAsyncThunk(
  "zone/fetchZones",
  async (_, { rejectWithValue }) => {
    try {
      let res = await AllZoneList();
      return res?.data?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const zoneSlice = createSlice({
  name: "zone",
  initialState,
  reducers: {
    getZones: (state) => {
      state.loading = true;
    },
    getZonesSuccess: (state, action) => {
      state.zones = action.payload;
      state.loading = false;
      state.error = null;
    },
    getZonesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchZones.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchZones.fulfilled, (state, action) => {
        state.zones = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchZones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { getZones, getZonesSuccess, getZonesFailure } = zoneSlice.actions;

export default zoneSlice.reducer;

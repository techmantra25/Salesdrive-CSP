import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AllStateList } from "../api/api";

const initialState = {
  states: [],
  loading: false,
  error: null,
};

export const fetchStates = createAsyncThunk(
  "state/fetchStates",
  async (_, { rejectWithValue }) => {
    try {
      let res = await AllStateList();
      return res?.data?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const stateSlice = createSlice({
  name: "state",
  initialState,
  reducers: {
    getStates: (state) => {
      state.loading = true;
    },
    getStatesSuccess: (state, action) => {
      state.states = action.payload;
      state.loading = false;
      state.error = null;
    },
    getStatesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.states = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { getStates, getStatesSuccess, getStatesFailure } =
  stateSlice.actions;

export default stateSlice.reducer;

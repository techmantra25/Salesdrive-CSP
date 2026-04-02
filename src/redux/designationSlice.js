import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AllDesignationList } from "../api/api";

const initialState = {
  designations: [],
  loading: false,
  error: null,
};

export const fetchDesignations = createAsyncThunk(
  "designation/fetchDesignations",
  async (_, { rejectWithValue }) => {
    try {
      let res = await AllDesignationList();
      return res?.data?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const designationSlice = createSlice({
  name: "designation",
  initialState,
  reducers: {
    getDesignations: (state) => {
      state.loading = true;
    },
    getDesignationsSuccess: (state, action) => {
      state.designations = action.payload;
      state.loading = false;
      state.error = null;
    },
    getDesignationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDesignations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.designations = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchDesignations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  getDesignations,
  getDesignationsSuccess,
  getDesignationsFailure,
} = designationSlice.actions;

export default designationSlice.reducer;

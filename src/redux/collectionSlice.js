import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AllCollectionList } from "../api/api";

const initialState = {
  collections: [],
  loading: false,
  error: null,
};

export const fetchCollections = createAsyncThunk(
  "collection/fetchCollections",
  async (_, { rejectWithValue }) => {
    try {
      let res = await AllCollectionList();
      let sortedData = res?.data?.data?.sort(
        (a, b) => a?.original_id - b?.original_id
      );
      return sortedData;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const collectionSlice = createSlice({
  name: "collection",
  initialState,
  reducers: {
    getCollections: (state) => {
      state.loading = true;
    },
    getCollectionsSuccess: (state, action) => {
      state.collections = action.payload;
      state.loading = false;
      state.error = null;
    },
    getCollectionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.collections = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { getCollections, getCollectionsSuccess, getCollectionsFailure } =
  collectionSlice.actions;

export default collectionSlice.reducer;

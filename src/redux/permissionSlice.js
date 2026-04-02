import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserPermission } from "../api/api";

export const fetchUserPermissions = createAsyncThunk(
 
  "permission/fetchUserPermissions",
  async (payload, { rejectWithValue }) => {
    try {
      const userId =
        typeof payload === "string"
          ? payload
          : payload?._id;

      if (!userId) {
        throw new Error("User ID is missing");
      }
      const data = await getUserPermission(userId);
      return data; 
    } catch (error) {
      
      return rejectWithValue(
        error?.response?.data?.message || error.message
      );
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const permissionSlice = createSlice({
  name: "permission",
  initialState,
  reducers: {
    clearPermissions: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPermissions.pending, (state) => {
        console.log("Permission Loading...");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        console.log("Permission Stored in Redux:", action.payload);
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        console.log("Permission Rejected:", action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPermissions } = permissionSlice.actions;
export default permissionSlice.reducer;

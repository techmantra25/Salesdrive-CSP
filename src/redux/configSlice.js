import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  config: localStorage.getItem("DMS_CONFIG")
    ? JSON.parse(localStorage.getItem("DMS_CONFIG"))
    : null,
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setConfig: (state, action) => {
      state.config = action.payload;
      localStorage.setItem("DMS_CONFIG", JSON.stringify(action.payload));
    },
  },
});

export const { setConfig } = configSlice.actions;

export default configSlice.reducer;

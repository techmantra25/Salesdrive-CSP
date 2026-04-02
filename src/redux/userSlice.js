import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: localStorage.getItem("DMS_USERINFO")
    ? JSON.parse(localStorage.getItem("DMS_USERINFO"))
    : null,
};

const userSlice = createSlice({

  name: "user",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, ...userInfo } = action.payload;
      state.userInfo = userInfo;
      localStorage.setItem("DMS_USERINFO", JSON.stringify(userInfo));
    },

    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem("DMS_USERINFO");
    },
  },
});

export const { setCredentials, logout } = userSlice.actions;

export default userSlice.reducer;

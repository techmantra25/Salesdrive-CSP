import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  soundEnabled: true,
};

const notificationSettingsSlice = createSlice({
  name: "notificationSettings",
  initialState,
  reducers: {
    setSoundEnabled(state, action) {
      state.soundEnabled = action.payload;
    },
  },
});

export const { setSoundEnabled } = notificationSettingsSlice.actions;
export default notificationSettingsSlice.reducer;

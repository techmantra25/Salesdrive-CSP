import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";
import brandReducer from "./brandSlice";
import categoryReducer from "./categorySlice";
import collectionReducer from "./collectionSlice";
import distributorListReducer from "./distributorListSlice";
import productReducer from "./productSlice";
import regionReducer from "./regionSlice";
import stateReducer from "./stateSlice";
import userReducer from "./userSlice";
import zoneReducer from "./zoneSlice";
import designationReducer from "./designationSlice";
import beatReducer from "./beatSlice";
import configReducer from "./configSlice";
import notificationSettingsReducer from "../store/slices/notificationSettingsSlice";
import permissionReducer from "./permissionSlice";

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    user: userReducer,
    config: configReducer,
    category: categoryReducer,
    permission: permissionReducer,
    collection: collectionReducer,
    product: productReducer,
    region: regionReducer,
    zone: zoneReducer,
    state: stateReducer,
    brand: brandReducer,
    distributors: distributorListReducer,
    designations: designationReducer,
    beat: beatReducer,
    notificationSettings: notificationSettingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: import.meta.env.VITE_NODE_ENV === "development",

});

export default store;

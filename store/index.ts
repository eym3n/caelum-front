import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import landingPagesReducer from "./landingPages/landingPagesSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    landingPages: landingPagesReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



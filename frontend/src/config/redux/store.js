// Steps for state management
// Submit action
// handle action in its reducer
// register here -> reducer

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import postsReducer from "./reducer/postReducer";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postsReducer, // state.auth , state.post
  },

  //enable Redux DevTools automatically in development
  devTools: process.env.NODE_ENV !== "production",

  //added middleware configuration for better debugging
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});
/**
 * STEPS for Sate Management
 * Submit actions from components
 * Create reducers to handle actions
 * Create store to hold state
 * Register store with the app
 * 
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";  
import postReducer  from "./reducer/postReducer"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
  },
});
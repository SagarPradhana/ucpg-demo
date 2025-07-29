import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./loginReducer";
import singleUserDetailsReducer from "./singleUserDetailsReducer";

export const store = configureStore({
  reducer: {
    auth: loginReducer,
    singleUserDetails: singleUserDetailsReducer,
  },
});

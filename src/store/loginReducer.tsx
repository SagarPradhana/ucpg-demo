import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, UserState } from "@/types";

const initialState: UserState = {
  userDetails: null,
  isAuthenticated: false,
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setUserDetails: (state, action: PayloadAction<User>) => {
      state.userDetails = action.payload;
      state.isAuthenticated = true;
    },
    clearUserDetails: (state) => {
      state.userDetails = null;
      state.isAuthenticated = false;
    },
  },
});

export const loginActions = loginSlice.actions;
export default loginSlice.reducer;

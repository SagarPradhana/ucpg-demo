import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userDetails: null,
};
const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setUserDetails: (state, action) => ({
      ...state,
      userDetails: action.payload,
    }),
  },
});

export const loginActions = loginSlice.actions;
export default loginSlice.reducer;

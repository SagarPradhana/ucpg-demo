import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types";

interface SingleUserDetailsState {
  userDetails: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: SingleUserDetailsState = {
  userDetails: null,
  loading: false,
  error: null,
};

const singleUserDetailsSlice = createSlice({
  name: "singleUserDetails",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null; // Clear error when loading starts
      }
    },
    setSingleUserDetails: (state, action: PayloadAction<User>) => {
      state.userDetails = action.payload;
      state.loading = false;
      state.error = null;
      console.log("✅ Single user details stored in Redux:", action.payload);
    },
    setSingleUserError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      console.error("❌ Single user details error:", action.payload);
    },
    clearSingleUserDetails: (state) => {
      state.userDetails = null;
      state.loading = false;
      state.error = null;
      console.log("🗑️ Single user details cleared from Redux");
    },
  },
});

export const singleUserDetailsActions = singleUserDetailsSlice.actions;
export default singleUserDetailsSlice.reducer;

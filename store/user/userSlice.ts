import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/lib/api/auth";

export interface UserState {
  profile: AuthUser | null;
}

const initialState: UserState = {
  profile: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.profile = action.payload;
    },
    clearUser(state) {
      state.profile = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;



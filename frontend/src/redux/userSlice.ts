import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CurrentUser } from "../features/getCurrentUser";

type UserState = {
  userData: CurrentUser | null;
};

const initialState: UserState = {
  userData: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<CurrentUser | null>) => {
      state.userData = action.payload;
    },
  },
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;

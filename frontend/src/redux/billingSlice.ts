import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Subscription } from "../types/types";

type BillingState = {
  subscription: Subscription | null;
  // In Redux so places outside the Sidebar (e.g. the no-credits notice) can
  // open the drawer
  isBillingOpen: boolean;
};

const initialState: BillingState = {
  subscription: null,
  isBillingOpen: false,
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    setSubscription: (state, action: PayloadAction<Subscription | null>) => {
      state.subscription = action.payload;
    },
    setBillingOpen: (state, action: PayloadAction<boolean>) => {
      state.isBillingOpen = action.payload;
    },
    // The agent returns the balance after each message; keep the bar in step
    // without refetching the whole subscription
    setRemainingCredits: (state, action: PayloadAction<number>) => {
      if (!state.subscription) return;
      state.subscription.usedCredits =
        state.subscription.totalCredits - action.payload;
    },
  },
});

export const { setSubscription, setRemainingCredits, setBillingOpen } =
  billingSlice.actions;
export default billingSlice.reducer;

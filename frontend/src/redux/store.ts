import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import conversationReducer from "./conversationSlice";
import messageReducer from "./messageSlice";
import billingReducer from "./billingSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    conversation: conversationReducer,
    message: messageReducer,
    billing: billingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

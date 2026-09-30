import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Conversation } from "../types/conversation";

type MessageState = {
  messages: Conversation[] | null;
};
const initialState: MessageState = {
  messages: [],
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Conversation[] | null>) => {
      state.messages = action.payload;
    },
  },
});

export const { setMessages } = messageSlice.actions;
export default messageSlice.reducer;

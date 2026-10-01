import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Message } from "../types/types";

type MessageState = {
  messages: Message[] | null;
};
const initialState: MessageState = {
  messages: [],
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[] | null>) => {
      state.messages = action.payload;
    },

    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages?.push(action.payload);
    },
  },
});

export const { setMessages, addMessage } = messageSlice.actions;
export default messageSlice.reducer;

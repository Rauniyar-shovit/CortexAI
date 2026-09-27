import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Conversation } from "../types/conversation";

type ConversationState = {
  conversations: Conversation[] | null;
  selectedConversation: Conversation | null;
};
const initialState: ConversationState = {
  conversations: [],
  selectedConversation: null,
};

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[] | null>) => {
      state.conversations = action.payload;
    },

    addConversation: (state, action: PayloadAction<Conversation | null>) => {
      if (!action.payload) return;
      state.conversations?.unshift(action.payload);
    },

    setSelectConversations: (
      state,
      action: PayloadAction<Conversation | null>,
    ) => {
      state.selectedConversation = action.payload;
    },
  },
});

export const { setConversations, addConversation, setSelectConversations } =
  conversationSlice.actions;
export default conversationSlice.reducer;

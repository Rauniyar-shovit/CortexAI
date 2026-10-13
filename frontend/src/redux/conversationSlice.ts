import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Conversation } from "../types/types";

type ConversationState = {
  conversations: Conversation[] | null;
  selectedConversation: Conversation | null;
  // Mobile sidebar drawer; the desktop sidebar is always on screen
  isSidebarOpen: boolean;
};
const initialState: ConversationState = {
  conversations: [],
  selectedConversation: null,
  isSidebarOpen: false,
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

    setSelectedConversation: (
      state,
      action: PayloadAction<Conversation | null>,
    ) => {
      state.selectedConversation = action.payload;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },

    setConvTitle: (
      state,
      action: PayloadAction<{ title: string; conversationId: string }>,
    ) => {
      const { title, conversationId } = action.payload;

      if (!state.conversations) return;

      state.conversations = state.conversations?.map((conv) =>
        conv._id === conversationId ? { ...conv, title } : conv,
      );

      if (state.selectedConversation?._id === conversationId) {
        state.selectedConversation = { ...state.selectedConversation, title };
      }
    },
  },
});

export const {
  setConversations,
  addConversation,
  setConvTitle,
  setSelectedConversation,
  setSidebarOpen,
} = conversationSlice.actions;
export default conversationSlice.reducer;

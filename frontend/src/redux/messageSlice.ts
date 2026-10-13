import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Artifact, Message } from "../types/types";

type MessageState = {
  messages: Message[] | null;
  artifacts: Artifact[];
  isArtifactOpen: boolean;
  isLoading: boolean;
};
const initialState: MessageState = {
  messages: [],
  artifacts: [],
  isArtifactOpen: false,
  isLoading: false,
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

    // Undo an optimistic message the server rejected
    removeLastMessage: (state) => {
      state.messages?.pop();
    },

    // Showing new artifacts opens the panel, as the design does when a response contains one.
    setArtifacts: (state, action: PayloadAction<Artifact[]>) => {
      state.artifacts = action.payload;
      state.isArtifactOpen = action.payload.length > 0;
    },

    closeArtifact: (state) => {
      state.isArtifactOpen = false;
    },

    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setMessages,
  addMessage,
  removeLastMessage,
  setArtifacts,
  closeArtifact,
  setIsLoading,
} = messageSlice.actions;
export default messageSlice.reducer;

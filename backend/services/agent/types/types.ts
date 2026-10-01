export type MessageRole = "user" | "assistant";

// Shape of a Message document as returned by the chat service (JSON-serialized).
// Server-assigned fields are optional because messages cached in Redis memory
// only store role and content.
export type Message = {
  _id?: string;
  conversationId?: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

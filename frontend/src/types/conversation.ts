// Shape of a Conversation document as returned by the chat service (JSON-serialized).
export type Conversation = {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CurrentUser = {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
};

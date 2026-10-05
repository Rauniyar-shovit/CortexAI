import type { LucideIcon } from "lucide-react";

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

export type MessageRole = "user" | "assistant";

export type ArtifactFile = {
  name: string;
  content: string;
};

// Mirrors artifactSchema in the chat service's message model.
export type Artifact = {
  id: number;
  title: string;
  type: string;
  files: ArtifactFile[];
};

// Shape of a Message document as returned by the chat service (JSON-serialized).
// Server-assigned fields are optional so messages can be added to the UI optimistically
// before they are persisted.
export type Message = {
  _id?: string;
  conversationId?: string;
  role: MessageRole;
  content: string;
  // Objects from a live agent response; plain URLs once persisted by the chat service.
  images?: string[];
  artifacts?: Artifact[];
  createdAt?: string;
  updatedAt?: string;
};

export type AgentId =
  | "auto"
  | "chat"
  | "coding"
  | "pdf"
  | "ppt"
  | "image"
  | "search";

export type Agent = {
  id: AgentId;
  label: string;
  icon: LucideIcon;
  hue: number;
};

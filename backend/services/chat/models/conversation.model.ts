import { Schema, model, type InferSchemaType } from "mongoose";

const conversationSchema = new Schema(
  {
    title: {
      type: String,
      default: "New Chat",
    },
    userId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export type Conversation = InferSchemaType<typeof conversationSchema>;

const Conversation = model("Conversation", conversationSchema);
export default Conversation;

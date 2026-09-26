import { Schema, model, type InferSchemaType } from "mongoose";

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
    },
    content: String,
  },
  {
    timestamps: true,
  },
);

export type Message = InferSchemaType<typeof messageSchema>;

const Message = model("Message", messageSchema);
export default Message;

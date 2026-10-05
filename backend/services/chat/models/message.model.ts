import { Schema, model, type InferSchemaType } from "mongoose";

const fileSchema = new Schema(
  {
    name: String,
    content: String,
  },
  { _id: false },
);

const artifactSchema = new Schema(
  {
    title: String,
    id: Number,
    type: String,
    files: [fileSchema],
  },
  {
    _id: false,
  },
);

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
    images: [String],
    artifacts: [artifactSchema],
  },
  {
    timestamps: true,
  },
);

export type Message = InferSchemaType<typeof messageSchema>;

const Message = model("Message", messageSchema);
export default Message;

import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    firebaseUid: {
      type: String,
      unique: true,
    },

    name: String,
    email: String,
    avatar: String,
  },
  {
    timestamps: true,
  },
);

export type User = InferSchemaType<typeof userSchema>;

const User = model("User", userSchema);
export default User;

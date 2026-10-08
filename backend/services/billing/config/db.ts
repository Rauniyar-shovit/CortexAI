import mongoose from "mongoose";

const connectDb = async (MONGODB_URI: string) => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("db connected");
  } catch (error) {
    console.log(`db error ${error}`);
  }
};

export default connectDb;

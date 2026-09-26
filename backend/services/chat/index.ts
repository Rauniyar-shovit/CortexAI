import "dotenv/config";
import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.ts";
import { cleanEnv, str, port } from "envalid";
import router from "./routes/chat.routes.ts";

const env = cleanEnv(process.env, {
  PORT: port(),
  MONGODB_URI: str(),
});

const chatPort = env.PORT;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/", router);
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "hello from chat" });
});

app.listen(chatPort, () => {
  console.log(`Chat started on port ${chatPort}`);
  connectDb(env.MONGODB_URI);
});

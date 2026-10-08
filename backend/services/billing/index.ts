import "dotenv/config";
import express, { type Request, type Response } from "express";
import connectDb from "./config/db.ts";
import { cleanEnv, str, port } from "envalid";

const env = cleanEnv(process.env, {
  PORT: port(),
  MONGODB_URI: str(),
});

const authPort = env.PORT;

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "hello from billings" });
});

app.listen(authPort, () => {
  console.log(`Billings started on port ${authPort}`);
  connectDb(env.MONGODB_URI);
});

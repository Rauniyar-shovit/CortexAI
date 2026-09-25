import "dotenv/config";
import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.ts";
import { cleanEnv, str, port } from "envalid";
import router from "./routes/auth.route.ts";

const env = cleanEnv(process.env, {
  PORT: port(),
  MONGODB_URI: str(),
});

const authPort = env.PORT;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/", router);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "hello from auth" });
});

app.listen(authPort, () => {
  console.log(`Auth started on port ${authPort}`);
  connectDb(env.MONGODB_URI);
});

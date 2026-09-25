import dotenv from "dotenv";

import cors from "cors";
import proxy from "express-http-proxy";
import cookieParser from "cookie-parser";
import express, { type Express, type Request, type Response } from "express";
import { cleanEnv, port, str } from "envalid";
dotenv.config();

const env = cleanEnv(process.env, {
  PORT: port(),
  AUTH_SERVICE: str(),
  FRONTEND_URL: str(),
});

const gatewayPort = env.PORT;

const app: Express = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(cookieParser());

app.use("/api/auth", proxy(env.AUTH_SERVICE));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/", (req, res) => {
  res.json({ message: "hello from gateway" });
});

app.listen(gatewayPort, () => {
  console.log(`Gatway started on port ${gatewayPort}`);
});

import "dotenv/config";
import cors from "cors";
import proxy from "express-http-proxy";
import cookieParser from "cookie-parser";
import express, { type Express, type Request, type Response } from "express";
import { cleanEnv, port, str } from "envalid";
import protect from "./middleware/auth.middleware.ts";
import { getCurrentUser } from "./controllers/user.controller.ts";
import { proxyWithHeader } from "./utils/proxyWithHeader.ts";

const env = cleanEnv(process.env, {
  PORT: port(),
  AUTH_SERVICE: str(),
  CHAT_SERVICE: str(),
  AGENT_SERVICE: str(),
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
app.use("/api/chat", protect, proxyWithHeader(env.CHAT_SERVICE));
app.use("/api/agent", protect, proxy(env.AGENT_SERVICE));
app.get("/api/getCurrentUser", protect, getCurrentUser);

app.get("/", (req, res) => {
  res.json({ message: "hello from gateway" });
});

app.listen(gatewayPort, () => {
  console.log(`Gatway started on port ${gatewayPort}`);
});

import "dotenv/config";
import connectDb from "./config/db.ts";
import { cleanEnv, str, port } from "envalid";
import express, { type Request, type Response } from "express";
import router from "./routes/agent.route.ts";

const env = cleanEnv(process.env, {
  PORT: port(),
  MONGODB_URI: str(),
});

const agentPort = env.PORT;

const app = express();
app.use(express.json());
app.use("/", router);
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "hello from agent" });
});

app.listen(agentPort, () => {
  console.log(`Agent started on port ${agentPort}`);
  connectDb(env.MONGODB_URI);
});

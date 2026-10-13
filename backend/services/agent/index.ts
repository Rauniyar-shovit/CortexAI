import "dotenv/config";
import connectDb from "./config/db.ts";
import { cleanEnv, str, port } from "envalid";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
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

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.log(error);

  if (error.status) {
    return res.status(error.status).json(error.data);
  }

  return res.status(500).json({ message: `agent error ${error}` });
});

app.listen(agentPort, () => {
  console.log(`Agent started on port ${agentPort}`);
  connectDb(env.MONGODB_URI);
});

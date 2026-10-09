import "dotenv/config";
import express, { type Request, type Response } from "express";
import connectDb from "./config/db.ts";
import { cleanEnv, str, port } from "envalid";
import router from "./routes/billing.routes.ts";
import { handleWebhook } from "./controllers/billing.controller.ts";

const env = cleanEnv(process.env, {
  PORT: port(),
  MONGODB_URI: str(),
});

const authPort = env.PORT;

const app = express();

// Stripe signs the raw request body, so the webhook must be registered
// before express.json() parses it
app.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

app.use(express.json());
app.use("/", router);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "hello from billings" });
});

app.listen(authPort, () => {
  console.log(`Billings started on port ${authPort}`);
  connectDb(env.MONGODB_URI);
});

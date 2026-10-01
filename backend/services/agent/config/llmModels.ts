import { ChatGroq } from "@langchain/groq";
import { cleanEnv, str, port } from "envalid";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const env = cleanEnv(process.env, {
  GROQ_API_KEY: str(),
  GOOGLE_API_KEY: str(),
});

const groq = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
});

const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-pro",
  apiKey: env.GOOGLE_API_KEY,
});

export const getModel = async (agent: string) => {
  switch (agent) {
    case "chat":
      return groq;

    case "search":
      return groq;

    case "coding":
      return gemini;

    default:
      return groq;
  }
};

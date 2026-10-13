import type { Document } from "@langchain/core/documents";
import { QdrantVectorStore } from "@langchain/qdrant";
import { cleanEnv, str } from "envalid";
import { embeddings } from "./embeddings";

const env = cleanEnv(process.env, {
  QDRANT_URL: str(),
});

export const vectorStore = (
  docs: Document[],
  collectionName: string,
): Promise<QdrantVectorStore> =>
  QdrantVectorStore.fromDocuments(docs, embeddings, {
    url: env.QDRANT_URL,
    collectionName,
  });

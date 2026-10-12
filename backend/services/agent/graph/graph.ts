import { StateGraph, START, END } from "@langchain/langgraph";
import { agentState } from "./state.ts";
import { router } from "./router";
import { chatAgent } from "../agents/chat.agent.ts";
import { codingAgent } from "../agents/coding.agent";
import { visionAgent } from "../agents/vision.ts";
import { pdfAgent } from "../agents/pdf.agent.ts";
import { pptAgent } from "../agents/ppt.agent.ts";
import { searchAgent } from "../agents/search.agent";
import { pdfRagAgent } from "../agents/pdgRag.agent.ts";
import { imageAnalyzerAgent } from "../agents/imageAnalyzer.agent.ts";

const workflow = new StateGraph(agentState)
  .addNode("router", router)
  .addNode("chat", chatAgent)
  .addNode("coding", codingAgent)
  .addNode("vision", visionAgent)
  .addNode("pdf", pdfAgent)
  .addNode("ppt", pptAgent)
  .addNode("pdfRag", pdfRagAgent)
  .addNode("imageAnalyzer", imageAnalyzerAgent)
  .addNode("search", searchAgent)
  .addEdge(START, "router");

workflow.addConditionalEdges(
  "router",
  (state) => {
    switch (state.agent) {
      case "chat":
        return "chat";

      case "search":
        return "search";

      case "ppt":
        return "ppt";

      case "pdf":
        return "pdf";

      case "coding":
        return "coding";

      case "vision":
        return "vision";
      case "pdfRag":
        return "pdfRag";

      case "imageAnalyzer":
        return "imageAnalyzer";

      default:
        return "chat";
    }
  },
  {
    chat: "chat",
    search: "search",
    pdf: "pdf",
    ppt: "ppt",
    vision: "vision",
    coding: "coding",
    pdfRag: "pdfRag",
    imageAnalyzer: "imageAnalyzer",
  },
);

workflow.addEdge("search", "chat");
workflow.addEdge("chat", END);
workflow.addEdge("coding", END);
workflow.addEdge("pdf", END);
workflow.addEdge("ppt", END);
workflow.addEdge("vision", END);
workflow.addEdge("pdfRag", END);
workflow.addEdge("imageAnalyzer", END);

export const graph = workflow.compile();

import fs from "fs/promises";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels";
import { AgentState } from "../graph/state";

export const imageAnalyzerAgent = async (state: AgentState) => {
  const file = state.file;

  try {
    if (!file) throw new Error("No image file provided");

    const llm = await getModel("imageAnalyzer");

    const imageBase64 = (await fs.readFile(file.path)).toString("base64");

    const message = [
      new SystemMessage(`
    You are OnyxAI ImageAnalyzer Agent.
Rules:
- Analyze only the uploaded image.
- Answer the user's question accurately.
- If text exists in the image, extract it.
- If charts or tables exist, explain them.
- If something is unclear, say so.
- Use Markdown when helpful.
- Do not hallucinate.
    
    `),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: state.prompt || "analyze the image",
          },
          {
            type: "imag_url",
            image_url: {
              url: `data:${state.file?.mimetype};base64,${imageBase64}`,
            },
          },
        ],
      }),
    ];

    const response = await llm.invoke(message);

    return {
      ...state,
      aiResponse: response.content,
    };
  } catch (error) {
    console.error("Image analyzer agent error:", error);

    return {
      ...state,
      aiResponse: "Sorry, I couldn't analyze the image. Please try again.",
    };
  } finally {
    // Multer writes uploads to ./temp; remove the file once we're done with it
    if (file) await fs.unlink(file.path).catch(() => {});
  }
};

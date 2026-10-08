import { getModel } from "../config/llmModels";
import { AgentState } from "../graph/state";
import axios from "axios";
import { uploadToS3 } from "../utils/uploadToS3";
import { getFromS3 } from "../utils/getFromS3";

export const visionAgent = async (state: AgentState) => {
  try {
    const llm = await getModel("image");

    const res = await llm.invoke(`
You are an elite AI image prompt engineer.
Convert the user request into a highly detailed image generation prompt.

Requirements:
- Cinematic lighting
- Professional composition
- Ultra realistic
- High detail
- Beautiful color palette
- Sharp focus
- 8K quality
- Photorealistic
- Depth of field
- Professional photography
- Stunning visuals
Return only the image prompt.
User Request:
${state.prompt}
`);

    const prompt = res.text.trim();
    if (!prompt) throw new Error("Empty image prompt from model");

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

    const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });

    const buffer = Buffer.from(imageRes.data);
    const filename = `${Date.now()}.png`;

    await uploadToS3(filename, buffer, "image/png");

    const downloadUrl = await getFromS3(filename, 24 * 10);

    return {
      ...state,
      aiResponse: `

 ![Generated Image](${downloadUrl})

⏳ [Download Image](${downloadUrl})
`,
    };
  } catch (error) {
    console.error("Vision agent error:", error);

    return {
      ...state,
      aiResponse: "Sorry, I couldn't generate the image. Please try again.",
    };
  }
};

import { getModel } from "../config/llmModels";
import { AgentState } from "../graph/state";
import { generatePpt, PptData } from "../utils/generatePpt";
import { getFromS3 } from "../utils/getFromS3";
import { uploadToS3 } from "../utils/uploadToS3";

export const pptAgent = async (state: AgentState) => {
  try {
    const llm = await getModel("ppt");
    const prompt = `You are a professional presentation designer.

Return ONLY valid JSON.

Format:
{
  "title": "",
  "subtitle": "",
  "slides": [
    {
      "title": "",
      "points": ["", "", "", ""]
    }
  ]
}

Rules:

- Generate exactly 6 content slides.
- Each slide should have 4-6 concise bullet points.
- No markdown.
- No explanation.
- No code block.
- Return ONLY JSON.

Topic:

${state.prompt}
`;

    const res = await llm.invoke(prompt);

    // strip a code fence if the model adds one anyway
    const raw = String(res.content).trim();

    let data: PptData;
    try {
      data = JSON.parse(raw);
      console.log(data);
    } catch {
      return {
        ...state,
        aiResponse:
          "Sorry, the PPT model returned invalid output. Please try again.",
      };
    }

    const pptBuffer = await generatePpt(data);

    const filename = `ppt-${Date.now()}.pptx`;
    await uploadToS3(
      filename,
      pptBuffer,
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );
    const downloadUrl = await getFromS3(filename, 60 * 10);

    return {
      ...state,
      aiResponse: `
# Presentation Generated

**${data.title}**

⬇️ [Download PPT](${downloadUrl})

Link expires in 10 minutes
`,
    };
  } catch (error) {
    console.error("PPT agent failed:", error);
    return {
      ...state,
      aiResponse: `Failed to generate PPT.`,
    };
  }
};

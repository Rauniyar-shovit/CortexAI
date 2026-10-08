import { getModel } from "../config/llmModels";
import { AgentState } from "../graph/state";
import { generatePdf, PdfData } from "../utils/generatePdf";
import { getFromS3 } from "../utils/getFromS3";
import { uploadToS3 } from "../utils/uploadToS3";

export const pdfAgent = async (state: AgentState) => {
  try {
    const llm = await getModel("pdf");

    const prompt = `
You are an expert document writer.
Return ONLY valid JSON.

Do NOT return markdown.

Do NOT return explanations.

Structure:

{
  "title": "",
  "subtitle": "",
  "sections": [
    {
      "heading": "",
      "points": []
    }
  ]
}

Generate 4-8 sections.

Each section should have 3-6 concise bullet points.

Topic:

${state.prompt}
`;

    const res = await llm.invoke(prompt);

    const raw = String(res.content);

    let data: PdfData;
    try {
      data = JSON.parse(raw);
    } catch {
      return {
        ...state,
        aiResponse:
          "Sorry, the PDF model returned invalid output. Please try again.",
      };
    }

    const pdfBuffer = await generatePdf(data);

    const filename = `pdf-${Date.now()}.pdf`;
    await uploadToS3(filename, pdfBuffer, "application/pdf");
    const downloadUrl = await getFromS3(filename, 60 * 10);

    return {
      ...state,
      aiResponse: `
# PDF Generated

**${data.title}**

⬇️ [Download PDF](${downloadUrl})

Link expires in 10 minutes_
`,
    };
  } catch (error) {
    console.error("PDF agent failed:", error);
    return {
      ...state,
      aiResponse: `Failed to generate PDF.`,
    };
  }
};

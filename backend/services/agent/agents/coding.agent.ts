import { getModel } from "../config/llmModels.ts";
import { AgentState } from "../graph/state";

export const codingAgent = async (state: AgentState) => {
  const intentLlm = await getModel("intent");
  const llm = await getModel("coding");
  const intentRes = await intentLlm.invoke(`You are an intent classifier.
Return ONLY one of these values.
CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION
User Request:
${state.prompt}`);

  const intent = intentRes.text.trim();

  if (intent === "CODE_GENERATION") {
    const prompt = `You are OnyxAI Coding Agent.
Generate the requested project.
Default stack:
- HTML
- CSS
- JavaScript
I
Use React / Next.js / Vue ONLY if explicitly requested.
Rules:
- Responsive
- Modern UI
- CSS Variables
- Flexbox/Grid
- Smooth Scroll
- Hover Effects
- Beautiful spacing
- Single page unless user asks otherwise.

IMAGES 
=========================

Always use real Unsplash images.

Never use placeholders.

Return ONLY valid JSON.

Schema:
{

"files": [
    {
    "name": "index.html",
    "content":"..." 
    ｝,{

    "name": "style.css"
    "content":"..."
    },{
    "name": "script.js",
    "content":"..."
     }
    ]
  }


  Rules:
- Output must start with {
- Output must end with }
- No markdown
- No explanation
- No extra text
- No l'l'l
- Never mention intent
I
User Request:
${state.prompt}
`;

    const res = await llm.invoke(prompt);

    const raw = String(res.content)
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");

    let data: { files?: { name: string; content: string }[] };
    try {
      data = JSON.parse(raw);
    } catch {
      return {
        ...state,
        aiResponse:
          "Sorry, the coding model returned invalid output. Please try again.",
        artifacts: [],
      };
    }

    return {
      ...state,
      aiResponse: "Code Generated Successfully",
      artifacts: [
        {
          title: state.prompt,
          id: Date.now(),
          type: "Project",
          files: data.files || [],
        },
      ],
    };
  }

  const prompt = `
    The user's request is 

    ${intent}
Return Markdown only.

Never generate project files.

Use headings like:

# Overview

## Explanation

## Problems

##Improvements

## Best Practices

##Optimized Code (if needed)


User Request:
${state.prompt}
`;

  const res = await llm.invoke(prompt);

  const data = String(res.content);

  return {
    ...state,
    aiResponse: data,
    artifacts: [],
  };
};

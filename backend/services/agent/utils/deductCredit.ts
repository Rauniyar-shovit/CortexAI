import { cleanEnv, str } from "envalid";
import axios from "axios";
import type { AgentName } from "../graph/state.ts";
const env = cleanEnv(process.env, {
  BILLING_SERVICE: str(),
});

// Spend the agent's credit cost in the billing service before running it
export const deductCredit = async (
  userId: string,
  agent: Exclude<AgentName, "auto">,
) => {
  try {
    const { data } = await axios.post<{ remainingCredits: number }>(
      `${env.BILLING_SERVICE}/deduct-credit`,
      { agent },
      { headers: { "x-user-id": userId } },
    );

    return { ok: true, remainingCredits: data.remainingCredits };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 402) {
      const { cost, remainingCredits } = error.response.data;
      return { ok: false, reason: "insufficient", cost, remainingCredits };
    }

    console.log(error);
    return { ok: false, reason: "error" };
  }
};

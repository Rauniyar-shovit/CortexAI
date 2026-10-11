import api from "../utils/axios";
import type { PlanId } from "../types/types";

// Passing a plan opens the portal straight on the confirm-change page
const createPortalSession = async (plan?: PlanId): Promise<string | null> => {
  try {
    const { data } = await api.post<{ portalUrl: string }>(
      "/api/billing/create-portal-session",
      { plan },
    );
    return data.portalUrl;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default createPortalSession;

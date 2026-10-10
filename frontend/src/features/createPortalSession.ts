import api from "../utils/axios";

const createPortalSession = async (): Promise<string | null> => {
  try {
    const { data } = await api.post<{ portalUrl: string }>(
      "/api/billing/create-portal-session",
    );
    return data.portalUrl;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default createPortalSession;

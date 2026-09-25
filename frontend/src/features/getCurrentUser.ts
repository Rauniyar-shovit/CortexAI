import api from "../utils/axios";

export type CurrentUser = {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
};

const getCurrentUser = async (): Promise<CurrentUser | null> => {
  try {
    const { data } = await api.get<CurrentUser>("/api/auth/getCurrentUser");
    return data;
  } catch {
    return null;
  }
};

export default getCurrentUser;

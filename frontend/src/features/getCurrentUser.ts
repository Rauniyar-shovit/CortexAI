import type { CurrentUser } from "../types/types";
import api from "../utils/axios";

const getCurrentUser = async (): Promise<CurrentUser | null> => {
  try {
    const { data } = await api.get<CurrentUser>("/api/getCurrentUser");
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default getCurrentUser;

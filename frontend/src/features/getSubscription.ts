import api from "../utils/axios";
import type { Subscription } from "../types/types";

const getSubscription = async (): Promise<Subscription | null> => {
  try {
    const { data } = await api.get<Subscription>("/api/billing/subscription");
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default getSubscription;

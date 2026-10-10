import { isAxiosError } from "axios";
import api from "../utils/axios";
import type { CheckoutSession, PlanId } from "../types/types";

const createOrder = async (plan: PlanId): Promise<CheckoutSession | null> => {
  try {
    const { data } = await api.post<CheckoutSession>(
      "/api/billing/create-checkout-session",
      { plan },
    );
    console.log(data);
    return data;
  } catch (error) {
    // Paying users change plan in the billing portal, not a new checkout
    if (isAxiosError(error) && error.response?.status === 409) {
      return { message: error.response.data.message, alreadySubscribed: true };
    }
    console.log(error);
    return null;
  }
};

export default createOrder;

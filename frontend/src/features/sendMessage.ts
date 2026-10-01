import api from "../utils/axios";

type Payload = {
  prompt: string;
  conversationId: string | undefined;
};
const sendMessage = async (payload: Payload) => {
  try {
    const { data } = await api.post("/api/agent/chat", payload);
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default sendMessage;

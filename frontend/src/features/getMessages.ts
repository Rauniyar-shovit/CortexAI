import api from "../utils/axios";

const getMessages = async (id: string | undefined) => {
  try {
    const { data } = await api.get(`/api/chat/get-messages/${id}`);
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default getMessages;

import { useDispatch, useSelector } from "react-redux";
import ChatNavbar from "./ChatNavbar";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { RootState } from "../redux/store";
import { useEffect } from "react";
import getMessages from "../features/getMessages";
import { setMessages } from "../redux/messageSlice";

const ChatArea = () => {
  const { selectedConversation } = useSelector(
    (state: RootState) => state?.conversation,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMessages = async () => {
      const data = await getMessages(selectedConversation?._id);
      dispatch(setMessages(data));
    };

    if (selectedConversation) {
      if (selectedConversation.title === "New Chat") return;
      fetchMessages();
    }
  }, [selectedConversation?._id]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3.5">
      <ChatNavbar />
      <MessageList />
      <ChatInput />
    </div>
  );
};

export default ChatArea;

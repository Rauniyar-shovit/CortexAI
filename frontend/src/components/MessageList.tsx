import NewConversationText from "./WelcomeScreen";
import type { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble";
import LoadingAnimation from "./LoadingAnimation";
import { useEffect, useRef } from "react";

const MessageList = () => {
  const { messages, isLoading } = useSelector(
    (state: RootState) => state?.message,
  );

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages?.length, isLoading]);

  const { selectedConversation } = useSelector(
    (state: RootState) => state?.conversation,
  );
  return (
    <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
      {messages?.length === 0 || !selectedConversation ? (
        <NewConversationText />
      ) : (
        <div className="mx-auto flex w-full max-w-190 flex-col gap-7 pb-4">
          {messages?.map((message, index) => (
            <MessageBubble
              key={index}
              role={message.role}
              content={message.content}
              images={message.images}
              artifacts={message.artifacts}
            />
          ))}
          {isLoading && <LoadingAnimation />}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;

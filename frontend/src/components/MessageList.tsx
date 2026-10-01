import NewConversationText from "./WelcomeScreen";
import type { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble";

const FollowUps = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => (
      <button
        key={item}
        type="button"
        className="cursor-pointer rounded-full bg-sf px-3 py-1.75 text-[13px] font-semibold text-ink transition-colors hover:bg-sf2"
      >
        {item}
      </button>
    ))}
  </div>
);

const MessageList = () => {
  const { messages } = useSelector((state: RootState) => state?.message);

  const { selectedConversation } = useSelector(
    (state: RootState) => state?.conversation,
  );
  return (
    <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
      {messages?.length === 0 || !selectedConversation ? (
        <NewConversationText />
      ) : (
        <div className="mx-auto flex w-full max-w-190 flex-col gap-4.5 pb-4">
          {messages?.map((message, index) => (
            <MessageBubble
              key={index}
              role={message.role}
              content={message.content}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageList;

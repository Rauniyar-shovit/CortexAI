import Logo from "./Logo";
import Markdown from "react-markdown";
import type { Message } from "../types/types";

// Design only — renders content as plain text (no markdown / code parsing yet).
const MessageBubble = ({ role, content }: Message) => {
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="max-w-[70%] self-end rounded-[20px_20px_6px_20px] bg-ac px-4 py-3 text-[15px] wrap-break-word whitespace-pre-wrap text-aci">
        {content}
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Logo size={32} />
      <div className="flex min-w-0 flex-1 flex-col gap-3 pt-1 text-[15px] leading-[1.6] wrap-break-word whitespace-pre-wrap text-ink">
        <Markdown>{content}</Markdown>
      </div>
    </div>
  );
};

export default MessageBubble;

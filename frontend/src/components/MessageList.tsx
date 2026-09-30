import type { ReactNode } from "react";
import Logo from "./Logo";
import NewConversationText from "./WelcomeScreen";
import type { RootState } from "../redux/store";
import { useSelector } from "react-redux";

// Design only — placeholder conversation from the design until wired to real messages.
const PLACEHOLDER = {
  userMessage:
    "Can you explain Redis like I'm new to backends? And show a tiny example.",
  intro:
    "Think of Redis as a super-fast notebook that lives in memory. Your database is the big filing cabinet; Redis keeps the answers you need most often right on the desk.",
  code: {
    filename: "cache.js",
    content: `const cached = await redis.get(key);
if (cached) return JSON.parse(cached);

const data = await db.query(sql);
await redis.set(key, JSON.stringify(data), "EX", 60);
return data;`,
  },
  outro:
    "First we check the notebook. If the answer is there, we skip the database entirely. If not, we fetch it and jot it down for 60 seconds.",
  followUps: ["When not to cache?", "Show with Express"],
};

const UserBubble = ({ children }: { children: ReactNode }) => (
  <div className="max-w-[70%] self-end rounded-[20px_20px_6px_20px] bg-ac px-4 py-3 text-[15px] whitespace-pre-wrap text-aci">
    {children}
  </div>
);

const AssistantMessage = ({ children }: { children: ReactNode }) => (
  <div className="flex gap-3">
    <Logo size={32} />
    <div className="flex min-w-0 flex-1 flex-col gap-3 text-[15px] leading-relaxed text-ink">
      {children}
    </div>
  </div>
);

const CodeBlock = ({ filename, code }: { filename: string; code: string }) => (
  <div className="overflow-hidden rounded-[18px] bg-sf">
    <div className="flex items-center bg-sf2 px-3.5 py-2.5 text-xs font-bold text-mu">
      {filename}
      <button
        type="button"
        className="ml-auto cursor-pointer transition-colors hover:text-ink"
      >
        Copy
      </button>
    </div>
    <pre className="overflow-x-auto p-3.5 font-mono text-[13px] leading-[1.7] text-ink">
      <code>{code}</code>
    </pre>
  </div>
);

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
    <div className="min-h-0 flex-1 overflow-y-auto">
      {messages?.length === 0 || !selectedConversation ? (
        <NewConversationText />
      ) : (
        <div className="mx-auto flex w-full max-w-190 flex-col gap-4.5 pb-4">
          <UserBubble>{PLACEHOLDER.userMessage}</UserBubble>

          <AssistantMessage>
            <p>{PLACEHOLDER.intro}</p>
            <CodeBlock
              filename={PLACEHOLDER.code.filename}
              code={PLACEHOLDER.code.content}
            />
            <p>{PLACEHOLDER.outro}</p>
            <FollowUps items={PLACEHOLDER.followUps} />
          </AssistantMessage>
        </div>
      )}
    </div>
  );
};

export default MessageList;

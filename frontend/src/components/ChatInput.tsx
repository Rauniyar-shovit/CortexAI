import { ArrowUp, Mic, Plus } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import sendMessage from "../features/sendMessage";
import { addMessage } from "../redux/messageSlice";
import createConversation from "../features/createConversation";
import {
  addConversation,
  setConvTitle,
  setSelectedConversation,
} from "../redux/conversationSlice";
import updateConversation from "../features/updateConversation";
import { agents } from "../constants";
import type { AgentId } from "../types/types";

// Mode dot hues from the design: oklch(0.84 0.08 <hue>)

type ChatInputProps = {
  placeholder?: string;
};

// Design only — no send, mode switching, attach or voice behaviour yet.
const ChatInput = ({ placeholder = "Ask Onyx anything…" }: ChatInputProps) => {
  const [value, setValue] = useState<string>("");
  const { selectedConversation } = useSelector(
    (state: RootState) => state?.conversation,
  );

  const [selectedAgent, setSelectedAgent] = useState<AgentId>("auto");

  const dispatch = useDispatch();

  const handleSendMessage = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    let conversation = selectedConversation;

    if (!conversation) {
      const conv = await createConversation();
      dispatch(setSelectedConversation(conv));
      dispatch(addConversation(conv));
      conversation = conv;
    }

    if (conversation?.title === "New Chat") {
      await updateConversation({
        id: conversation._id,
        title: value.trim(),
      });

      dispatch(
        setConvTitle({
          conversationId: conversation._id,
          title: value.slice(0, 40),
        }),
      );
    }

    const payload = {
      prompt: value,
      conversationId: conversation?._id,
      agent: selectedAgent,
    };

    dispatch(addMessage({ role: "user", content: value.trim() }));

    setValue("");

    const data = await sendMessage(payload);
    if (!data) return;

    dispatch(
      addMessage({
        role: "assistant",
        content: data.answer,
        images: data.images,
      }),
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-190 flex-col gap-2.5">
      <form
        onSubmit={handleSendMessage}
        className="flex flex-col gap-2.5 rounded-[26px] bg-sf p-3.5 shadow-composer"
      >
        {/* agents pills */}
        <div className="flex flex-wrap gap-1.5">
          {agents.map((agent) => {
            const active = agent.id === selectedAgent;
            const Icon = agent.icon;
            return (
              <button
                onClick={() => setSelectedAgent(agent.id)}
                key={agent.id}
                type="button"
                aria-pressed={active}
                className={`flex cursor-pointer items-center gap-1.75 rounded-full px-3.25 py-1.75 text-[13px] font-bold transition-colors ${
                  active ? "bg-ac text-aci" : "bg-sf2 text-ink hover:bg-ac/40"
                }`}
              >
                <Icon
                  size={14}
                  style={{
                    color: active
                      ? "var(--aci)"
                      : `oklch(0.84 0.08 ${agent.hue})`,
                  }}
                />
                {agent.label}
              </button>
            );
          })}
        </div>

        {/* Message */}
        <textarea
          rows={1}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          value={value}
          aria-label="Message Onyx"
          className="field-sizing-content max-h-50 min-h-9 w-full resize-none bg-transparent px-1.5 py-2 text-base text-ink outline-none placeholder:text-mu"
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Attach"
            title="Attach"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-sf2 text-ink transition-colors hover:bg-ac/40"
          >
            <Plus size={20} />
          </button>
          <button
            type="button"
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-sf2 px-3.5 text-[13px] font-semibold text-mu transition-colors hover:text-ink"
          >
            <Mic size={15} />
            Voice
          </button>
          <button
            type="submit"
            aria-label="Send"
            title="Send"
            disabled={!value}
            className="ml-auto flex size-10 cursor-pointer items-center justify-center rounded-full bg-ink text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40"
          >
            <ArrowUp size={20} strokeWidth={2.5} />
          </button>
        </div>
      </form>

      <p className="text-center text-xs text-mu">
        Onyx can make mistakes. Double-check anything important.
      </p>
    </div>
  );
};

export default ChatInput;

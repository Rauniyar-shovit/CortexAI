import { ArrowUp, FileText, ImageIcon, Paperclip, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import sendMessage from "../features/sendMessage";
import {
  addMessage,
  closeArtifact,
  removeLastMessage,
  setArtifacts,
  setIsLoading,
} from "../redux/messageSlice";
import createConversation from "../features/createConversation";
import {
  addConversation,
  setConvTitle,
  setSelectedConversation,
} from "../redux/conversationSlice";
import updateConversation from "../features/updateConversation";
import { agents } from "../constants";
import type { AgentId } from "../types/types";
import { setRemainingCredits } from "../redux/billingSlice";
import NoCredits from "./NoCredits";
import { isWideScreen } from "../utils";

type ChatInputProps = {
  placeholder?: string;
};

// Design only — no send, mode switching, attach or voice behaviour yet.
const ChatInput = ({ placeholder = "Ask Onyx anything…" }: ChatInputProps) => {
  const [value, setValue] = useState<string>("");
  const { selectedConversation } = useSelector(
    (state: RootState) => state?.conversation,
  );
  const { isLoading } = useSelector((state: RootState) => state?.message);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [selectedAgent, setSelectedAgent] = useState<AgentId>("auto");
  const [noCredits, setNoCredits] = useState<{
    cost: number;
    remainingCredits: number;
  } | null>(null);

  const dispatch = useDispatch();

  // Text is optional when a file is attached
  const canSend = (value.trim() !== "" || selectedFile !== null) && !isLoading;

  const handleSendMessage = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSend) return;
    setNoCredits(null);

    dispatch(setIsLoading(true));
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
        title: value.trim() || selectedFile?.name || "New Chat",
      });

      dispatch(
        setConvTitle({
          conversationId: conversation._id,
          title: (value.trim() || selectedFile?.name || "New Chat").slice(
            0,
            40,
          ),
        }),
      );
    }

    const formData = new FormData();
    formData.append("prompt", value.trim());
    formData.append("conversationId", conversation?._id ?? "");
    formData.append("agent", selectedAgent);
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    dispatch(addMessage({ role: "user", content: value.trim() }));

    setValue("");

    const data = await sendMessage(formData);

    dispatch(setIsLoading(false));

    if (!data) {
      return;
    }
    if ("noCredits" in data) {
      // Nothing was saved server-side: drop the optimistic message and give
      // the user their text back
      dispatch(removeLastMessage());
      setValue(value);
      dispatch(setRemainingCredits(data.remainingCredits));
      setNoCredits({
        cost: data.cost,
        remainingCredits: data.remainingCredits,
      });
      return;
    }

    dispatch(setRemainingCredits(data.remainingCredits));

    dispatch(
      addMessage({
        role: "assistant",
        content: data.answer,
        images: data.images,
        artifacts: data.artifacts,
      }),
    );

    // Only replies that produce artifacts touch the panel; plain replies leave it as it is.
    if (data.artifacts?.length) {
      dispatch(setArtifacts(data.artifacts));
      if (!isWideScreen()) dispatch(closeArtifact());
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-190 flex-col gap-2.5">
      {noCredits && (
        <NoCredits
          cost={noCredits.cost}
          remainingCredits={noCredits.remainingCredits}
          onDismiss={() => setNoCredits(null)}
        />
      )}
      <form
        onSubmit={handleSendMessage}
        className="flex flex-col gap-2.5 rounded-[22px] bg-sf p-3 shadow-composer sm:rounded-[26px] sm:p-3.5"
      >
        {/* agents pills — one swipeable row on phones, wrapping from sm up */}
        <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {agents.map((agent) => {
            const active = agent.id === selectedAgent;
            const Icon = agent.icon;
            return (
              <button
                onClick={() => setSelectedAgent(agent.id)}
                key={agent.id}
                type="button"
                aria-pressed={active}
                className={`flex shrink-0 cursor-pointer items-center gap-1.75 rounded-full px-3.25 py-1.75 text-[13px] font-bold transition-colors ${
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

        {/* Attached file */}
        {selectedFile && (
          <div className="flex w-fit max-w-full items-center gap-2 rounded-2xl bg-sf2 py-2 pr-2 pl-3 text-[13px] text-ink">
            {selectedFile.type.startsWith("image/") ? (
              <ImageIcon size={16} className="shrink-0 text-mu" />
            ) : (
              <FileText size={16} className="shrink-0 text-mu" />
            )}
            <span className="truncate font-semibold">{selectedFile.name}</span>
            <button
              type="button"
              aria-label="Remove file"
              title="Remove file"
              onClick={() => {
                setSelectedFile(null);
                // Clear the input so picking the same file again fires onChange
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-mu transition-colors hover:bg-ac/40 hover:text-ink"
            >
              <XIcon size={14} />
            </button>
          </div>
        )}

        {/* Message */}
        <textarea
          rows={1}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter adds a new line; skip while an IME is composing
            if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing)
              return;
            e.preventDefault();
            if (canSend) e.currentTarget.form?.requestSubmit();
          }}
          value={value}
          aria-label="Message Onyx"
          className="field-sizing-content max-h-50 min-h-9 w-full resize-none bg-transparent px-1.5 py-2 text-base text-ink outline-none placeholder:text-mu"
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (fileRef.current) {
                fileRef.current.click();
              }
            }}
            type="button"
            aria-label="Attach"
            title="Attach"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-sf2 text-ink transition-colors hover:bg-ac/40"
          >
            <input
              type="file"
              accept=".pdf, image/*"
              hidden
              ref={fileRef}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];

                if (file) {
                  setSelectedFile(file);
                }
              }}
            />
            <Paperclip size={15} />
          </button>

          <button
            type="submit"
            aria-label="Send"
            title="Send"
            disabled={!canSend}
            className="ml-auto flex size-11 cursor-pointer sm:size-10 items-center justify-center rounded-full bg-ink text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40"
          >
            <ArrowUp size={20} strokeWidth={2.5} />
          </button>
        </div>
      </form>

      <p className="hidden text-center text-xs text-mu sm:block">
        Onyx can make mistakes. Double-check anything important.
      </p>
    </div>
  );
};

export default ChatInput;

import { Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import {
  setSelectedConversation,
  setSidebarOpen,
} from "../redux/conversationSlice";
import { setArtifacts } from "../redux/messageSlice";

// Design only — values are placeholders until wired to the selected conversation.
const ChatNavbar = () => {
  const { selectedConversation } = useSelector(
    (state: RootState) => state?.conversation,
  );
  const { messages } = useSelector((state: RootState) => state?.message);
  const dispatch = useDispatch();

  const messageCount = messages?.length ?? 0;
  const mobileButton =
    "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[14px] bg-sb text-ink transition-colors hover:bg-sf2";

  return (
    <>
      {/* Mobile header (below md): menu, centred title, new chat */}
      <header className="flex items-center gap-2.5 pt-2.5 md:hidden">
        <button
          type="button"
          onClick={() => dispatch(setSidebarOpen(true))}
          aria-label="Open sidebar"
          title="Open sidebar"
          className={`${mobileButton} flex-col gap-1`}
        >
          <span className="h-0.5 w-4.5 rounded-full bg-ink" />
          <span className="h-0.5 w-4.5 rounded-full bg-ink" />
          <span className="mr-1.5 h-0.5 w-3 rounded-full bg-ink" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <h1 className="max-w-full truncate text-base font-extrabold text-ink">
            {selectedConversation?.title || "Onyx"}
          </h1>
          <span className="text-xs font-bold text-mu">
            {messageCount
              ? `${messageCount} ${messageCount === 1 ? "message" : "messages"}`
              : "New chat"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            dispatch(setSelectedConversation(null));
            dispatch(setArtifacts([]));
          }}
          aria-label="New chat"
          title="New chat"
          className={mobileButton}
        >
          <Plus size={22} />
        </button>
      </header>

      <header className="hidden items-center gap-2.5 py-1.5 md:flex">
        <h1 className="truncate text-[17px] font-extrabold text-ink">
          {selectedConversation?.title}
        </h1>
        {/* <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-aci ${MODE_CHIP[mode]}`}
      ></span> */}
        <span className="ml-auto shrink-0 text-[13px] text-mu">
          {messages?.length !== 0 ? `${messages?.length} messages` : <></>}
        </span>
      </header>
    </>
  );
};

export default ChatNavbar;

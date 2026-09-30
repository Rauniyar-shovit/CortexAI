import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

type ChatMode = "Auto" | "Chat" | "Coding" | "PDF" | "PPT" | "Image" | "Search";

const MODE_CHIP: Record<ChatMode, string> = {
  // Chip background per mode, as used in the design's chat headers.

  Auto: "bg-ac",
  Chat: "bg-ac2",
  Coding: "bg-ac3",
  PDF: "bg-ac",
  PPT: "bg-ac2",
  Image: "bg-ac",
  Search: "bg-ac3",
};

// Design only — values are placeholders until wired to the selected conversation.
const ChatNavbar = () => {
  const { selectedConversation } = useSelector(
    (state: RootState) => state?.conversation,
  );
  const { messages } = useSelector((state: RootState) => state?.message);

  return (
    <header className="flex items-center gap-2.5 py-1.5">
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
  );
};

export default ChatNavbar;

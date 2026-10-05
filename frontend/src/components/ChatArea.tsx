import { useDispatch, useSelector } from "react-redux";
import ChatNavbar from "./ChatNavbar";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { RootState } from "../redux/store";
import { useEffect } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import getMessages from "../features/getMessages";
import { setArtifacts, setMessages } from "../redux/messageSlice";
import Artifact from "./Artifact";

const ChatArea = () => {
  const { selectedConversation } = useSelector(
    (state: RootState) => state?.conversation,
  );
  const { artifacts, isArtifactOpen } = useSelector(
    (state: RootState) => state.message,
  );
  const showArtifact = isArtifactOpen && artifacts.length > 0;
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMessages = async () => {
      const data = await getMessages(selectedConversation?._id);
      console.log(data);
      dispatch(setMessages(data));

      const lastestArtifactMsg = [...data]
        .reverse()
        .find((msg) => msg.artifacts && msg.artifacts.length > 0);

      dispatch(setArtifacts(lastestArtifactMsg?.artifacts || []));
    };

    if (selectedConversation) {
      if (selectedConversation.title === "New Chat") return;
      fetchMessages();
    }
  }, [selectedConversation?._id]);

  return (
    // Fills <main>; height comes from the h-screen app shell, so no min-h-screen here.
    <div className="flex min-h-0 min-w-0 flex-1">
      {/* Chat column takes whatever width the artifact panel leaves */}
      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col gap-3.5 pt-1.5 pb-4 ${
          showArtifact ? "px-1" : "px-4 sm:px-10"
        }`}
      >
        <ChatNavbar />
        <MessageList />
        <ChatInput />
      </div>

      {/* Panel slides open by animating the wrapper's width from 0 to its content's
          fixed width; the 14px gap is padding inside it so it collapses too. */}
      <MotionConfig reducedMotion="user">
        <AnimatePresence initial={false}>
          {showArtifact && (
            <motion.div
              key="artifact-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                width: { type: "spring", stiffness: 260, damping: 32 },
                opacity: { duration: 0.2 },
              }}
              className="hidden min-h-0 shrink-0 overflow-hidden lg:flex"
            >
              <motion.div
                initial={{ x: 40 }}
                animate={{ x: 0 }}
                exit={{ x: 40 }}
                transition={{ type: "spring", stiffness: 260, damping: 32 }}
                className="flex min-h-0 w-[calc(clamp(360px,38vw,600px)+14px)] pl-3.5"
              >
                <Artifact />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </div>
  );
};

export default ChatArea;

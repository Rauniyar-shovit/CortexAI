import Logo from "./Logo";
import { useTheme } from "../utils/theme";
import { Coins, LogOut, Moon, Plus, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import getConversations from "../features/getConversations";
import { useDispatch, useSelector } from "react-redux";
import {
  addConversation,
  setConversations,
  setSelectConversations,
} from "../redux/conversationSlice";
import createConversation from "../features/createConversation";
import type { RootState } from "../redux/store";
import { setUserData } from "../redux/userSlice";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase";
import logOut from "../features/logout";

// Placeholder credits — replace with real data from the backend.
const CREDITS = { left: 42, total: 100, resetsInDays: 6 };
const creditsPercent = `${(CREDITS.left / CREDITS.total) * 100}%`;

const COLLAPSED_KEY = "onyx-sidebar-collapsed";

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
};

const Sidebar = () => {
  const { conversations, selectedConversation } = useSelector(
    (state: RootState) => state.conversation,
  );

  const { userData } = useSelector((state: RootState) => state.user);

  const [imageError, setImageError] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const isEmpty = !conversations?.length;
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversation = async () => {
      const data = await getConversations();
      dispatch(setConversations(data));
    };
    fetchConversation();
  }, [userData?.userId]);

  const handleCreateConverstion = async () => {
    const data = await createConversation();
    dispatch(addConversation(data));
  };

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, String(next));
    } catch {
      // storage unavailable — state still applies for this session
    }
  };

  const handleLogout = async () => {
    await logOut();
    await signOut(auth);
    dispatch(setUserData(null));
    navigate("/login", { replace: true });
  };

  const avatar = (
    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ac2 text-aci">
      {userData?.avatar && !imageError ? (
        <img
          src={userData.avatar}
          alt={userData.name}
          onError={() => setImageError(true)}
          className="size-full object-cover"
        />
      ) : (
        <User size={18} />
      )}
    </div>
  );

  const railButton =
    "flex size-10 cursor-pointer items-center justify-center rounded-[14px] transition-colors";

  return (
    <aside
      onClick={collapsed ? toggleCollapsed : undefined}
      title={collapsed ? "Expand sidebar" : undefined}
      className={`relative flex shrink-0 overflow-hidden rounded-[22px] bg-sb transition-[width] duration-300 ease-in-out motion-reduce:transition-none ${
        collapsed ? "w-16 cursor-pointer" : "w-[280px]"
      }`}
    >
      {/* Collapsed rail */}
      <div
        inert={!collapsed}
        className={`absolute inset-y-0 left-0 flex w-16 flex-col items-center gap-3 py-4 transition-opacity duration-200 motion-reduce:transition-none ${
          collapsed ? "opacity-100 delay-100" : "pointer-events-none opacity-0"
        }`}
      >
        <Logo size={30} />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCreateConverstion();
          }}
          aria-label="New chat"
          title="New chat"
          className={`${railButton} mt-1.5 bg-sf text-ink hover:bg-sf2`}
        >
          <Plus size={20} />
        </button>

        <button
          type="button"
          aria-label="Expand sidebar"
          className={`${railButton} text-xs font-bold text-mu hover:bg-sf hover:text-ink`}
        >
          Chats
        </button>

        {/* Credits — placeholder until the backend tracks credits */}
        <div
          title={`${CREDITS.left} / ${CREDITS.total} credits`}
          className="mt-auto flex w-11 flex-col items-center gap-1 rounded-[14px] bg-sf py-2"
        >
          <div className="text-sm font-extrabold text-ink">{CREDITS.left}</div>
          <div className="h-[5px] w-[26px] overflow-hidden rounded-full bg-sf2">
            <div className="h-full bg-ac" style={{ width: creditsPercent }} />
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleTheme();
          }}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Dark" : "Light"}
          className={`${railButton} bg-sf text-ink hover:bg-sf2`}
        >
          {isDark ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleLogout();
          }}
          aria-label="Log out"
          title="Log out"
          className={`${railButton} text-mu hover:bg-sf hover:text-ink`}
        >
          <LogOut size={17} />
        </button>

        <div title={userData?.name || "User"}>{avatar}</div>
      </div>

      {/* Expanded panel — fixed width so it slides under the clip instead of reflowing */}
      <div
        inert={collapsed}
        className={`flex w-[280px] shrink-0 flex-col gap-3.5 p-[18px] transition-opacity duration-200 motion-reduce:transition-none ${
          collapsed ? "pointer-events-none opacity-0" : "opacity-100 delay-100"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="cursor-pointer rounded-full transition hover:opacity-80"
          >
            <Logo size={30} />
          </button>
          <div className="text-[21px] font-extrabold text-ink">Onyx</div>
          <div className="ml-auto rounded-full bg-ac px-[9px] py-[3px] text-xs font-bold text-aci">
            Free
          </div>
        </div>

        {/* New chat */}
        <button
          type="button"
          className="flex cursor-pointer items-center justify-center gap-1 rounded-2xl bg-sf p-3 text-[15px] font-bold text-ink shadow-soft transition hover:bg-sf2"
          onClick={handleCreateConverstion}
        >
          <Plus size={18} />
          New chat
        </button>

        {/* Chat history */}
        {isEmpty ? (
          <div className="flex flex-col items-center gap-2 px-2.5 py-7 text-center">
            <div className="flex gap-1.5">
              <div className="size-2.5 rounded-full bg-ac" />
              <div className="size-2.5 rounded-full bg-ac2" />
              <div className="size-2.5 rounded-full bg-ac3" />
            </div>
            <div className="text-sm font-bold text-ink">No chats yet</div>
            <div className="text-[13px] text-mu">
              Your conversations will show up here.
            </div>
          </div>
        ) : (
          <nav className="-mx-1 flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-1">
            <div className="px-2 pt-1.5 text-xs font-bold text-mu">Recents</div>

            <div className="flex flex-col gap-2 scrollbar-none [&:;-webkit-scrollbar]:hidden">
              {conversations?.map((conv) => {
                const isActive = selectedConversation?._id === conv._id;

                return (
                  <button
                    key={conv._id}
                    type="button"
                    title={conv.title}
                    onClick={() => dispatch(setSelectConversations(conv))}
                    className={`cursor-pointer truncate rounded-xl px-3 py-2.5 text-left text-sm text-ink transition-colors ${
                      isActive ? "bg-sf font-bold" : "hover:bg-sf/60"
                    }`}
                  >
                    {conv?.title || "New Chat"}
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        <div className="mt-auto flex flex-col gap-2.5">
          {/* Credits — placeholder until the backend tracks credits */}
          <div className="flex flex-col gap-2 rounded-2xl bg-sf p-3">
            <div className="flex items-center gap-1">
              <div className="text-[13px] font-bold text-ink flex gap-2">
                <Coins size={18} className="text-ac" /> Credits
              </div>
              <div className="ml-auto text-[13px] font-bold text-ink">
                {CREDITS.left}
                <span className="font-semibold text-mu">
                  {" "}
                  / {CREDITS.total}
                </span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-sf2">
              <div
                className="h-full rounded-full bg-ac"
                style={{ width: creditsPercent }}
              />
            </div>
            <div className="flex items-center text-xs text-mu">
              Resets in {CREDITS.resetsInDays} days
              <button
                type="button"
                className="ml-auto cursor-pointer font-bold text-ink hover:underline"
              >
                Get more
              </button>
            </div>
          </div>

          {/* Theme toggle + logout */}
          <div className="flex gap-1.5">
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              aria-label="Dark mode"
              onClick={toggleTheme}
              className="flex flex-1 cursor-pointer items-center gap-2 rounded-[14px] bg-sf px-2.5 py-[9px] transition-colors hover:bg-sf2"
            >
              <span className="relative h-5 w-[34px] shrink-0 rounded-full bg-sf2">
                <span
                  className={`absolute top-[3px] size-3.5 rounded-full bg-ac transition-[left] duration-150 ${
                    isDark ? "left-[17px]" : "left-[3px]"
                  }`}
                />
              </span>
              <span className="text-[13px] font-bold text-ink">
                {isDark ? "Dark" : "Light"}
              </span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-1.5 rounded-[14px] bg-sf px-3 py-[9px] text-[13px] font-bold text-ink transition-colors hover:bg-sf2"
            >
              <LogOut size={14} />
              Log out
            </button>
          </div>

          {/* User card */}
          <div className="flex items-center gap-2.5 rounded-2xl bg-sf p-2.5">
            {avatar}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="truncate text-sm font-bold text-ink">
                {userData?.name || "User"}
              </div>
              <div className="truncate text-xs text-mu">
                Free plan · Upgrade
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

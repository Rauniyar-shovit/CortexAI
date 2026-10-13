import ChatArea from "../components/ChatArea";
import Sidebar from "../components/Sidebar";

const Home = () => {
  return (
    // Edge-to-edge on phones; dvh keeps the composer above mobile browser toolbars
    <div className="flex h-dvh gap-3.5 bg-bg font-sans transition-colors md:p-3.5">
      <Sidebar />
      <main className="flex min-h-0 min-w-0 flex-1">
        <ChatArea />
      </main>
    </div>
  );
};

export default Home;

import ChatArea from "../components/ChatArea";
import Sidebar from "../components/Sidebar";

const Home = () => {
  return (
    <div className="flex h-screen gap-3.5 bg-bg p-3.5 font-sans transition-colors">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-3.5 px-10 pt-1.5 pb-4">
        <ChatArea />
      </main>
    </div>
  );
};

export default Home;

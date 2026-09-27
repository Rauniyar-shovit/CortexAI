import Sidebar from "../components/Sidebar";

const Home = () => {
  return (
    <div className="flex h-screen gap-3.5 bg-bg p-3.5 font-sans transition-colors">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col" />
    </div>
  );
};

export default Home;

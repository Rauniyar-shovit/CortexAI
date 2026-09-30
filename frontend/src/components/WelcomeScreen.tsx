import Logo from "./Logo";

// Design only — suggestion cards don't do anything yet.
const SUGGESTIONS = [
  {
    title: "Write a Netflix clone",
    subtitle: "React + Tailwind starter",
    dot: "bg-ac",
  },
  {
    title: "Explain Redis",
    subtitle: "Like I'm new to backends",
    dot: "bg-ac2",
  },
  {
    title: "Build a dashboard",
    subtitle: "Charts, filters, dark mode",
    dot: "bg-ac3",
  },
];

const NewConversationText = () => {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-2.5 overflow-y-auto text-center">
      <div className="mb-2">
        <Logo size={64} />
      </div>
      <h1 className="text-4xl font-extrabold text-ink">
        Hey there! What are we making?
      </h1>
      <p className="max-w-115 text-[17px] text-mu">
        Code, docs, slides, images, or a quick answer. Pick a mode or just start
        typing.
      </p>

      <div className="mt-5.5 grid w-full max-w-180 grid-cols-1 gap-3 text-left sm:grid-cols-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            type="button"
            className="flex cursor-pointer flex-col gap-1.5 rounded-[18px] bg-sf p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:bg-sf2"
          >
            <span className={`size-2.5 rounded-full ${s.dot}`} />
            <span className="text-[15px] font-bold text-ink">{s.title}</span>
            <span className="text-[13px] text-mu">{s.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NewConversationText;

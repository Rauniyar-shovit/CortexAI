import Logo from "./Logo";

const NewConversationText = () => {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-2.5 overflow-y-auto text-center">
      <div className="mb-2 scale-75 sm:scale-100">
        <Logo size={64} />
      </div>
      <h1 className="text-[28px] leading-tight font-extrabold text-ink sm:text-4xl">
        Hey there! What are we making?
      </h1>
      <p className="max-w-115 text-[15px] text-mu sm:text-[17px]">
        Code, docs, slides, images, or a quick answer. Pick a mode or just start
        typing.
      </p>
    </div>
  );
};

export default NewConversationText;

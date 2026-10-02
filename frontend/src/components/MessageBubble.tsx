import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Logo from "./Logo";
import MarkdownContent from "./MarkdownContent";
import type { Message } from "../types/types";

type LightboxImageProps = {
  url: string;
  onClose: () => void;
};

const LightboxImage = ({ url, onClose }: LightboxImageProps) => {
  // Close on Esc while the lightbox is open.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={onClose}
      className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-[rgba(21,20,27,0.88)] p-4 backdrop-blur-sm sm:p-10"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        title="Close"
        autoFocus
        className="absolute top-3 right-3 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/22 sm:top-5 sm:right-5"
      >
        <X size={18} />
      </button>

      <img
        src={url}
        alt="Search result"
        onClick={(e) => e.stopPropagation()}
        onError={(e) => e.currentTarget.remove()}
        className="max-h-full max-w-full cursor-default rounded-2xl object-contain shadow-[0_20px_50px_rgba(0,0,0,0.35)] select-none sm:rounded-[22px]"
      />
    </div>
  );
};

const MessageBubble = ({ role, content, images }: Message) => {
  const isUser = role === "user";
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (isUser) {
    return (
      <div className="max-w-[70%] self-end rounded-[20px_20px_6px_20px] bg-ac px-4 py-3 text-[15px] wrap-break-word whitespace-pre-wrap text-aci">
        {content}
      </div>
    );
  }

  return (
    <div className="flex gap-3 pr-4 sm:pr-14 max-w-[95%]">
      <Logo size={32} />
      <div className="flex min-w-0 flex-1 flex-col gap-3 pt-1 text-[15px] leading-[1.6] wrap-break-word text-ink">
        {images && images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 whitespace-normal sm:grid-cols-3">
            {images.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setLightbox(url)}
                aria-label={`View image ${i + 1}`}
                className="group relative aspect-4/3 cursor-zoom-in overflow-hidden rounded-[14px] bg-sf2 shadow-card outline-none focus-visible:ring-2 focus-visible:ring-ac"
              >
                <img
                  src={url}
                  alt={`Search result ${i + 1}`}
                  loading="lazy"
                  onError={(e) => e.currentTarget.remove()}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-[rgba(29,26,48,0)] transition-colors group-hover:bg-[rgba(29,26,48,0.12)]" />
              </button>
            ))}
          </div>
        )}

        <MarkdownContent content={content} />
      </div>

      {lightbox && (
        <LightboxImage url={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
};

export default MessageBubble;

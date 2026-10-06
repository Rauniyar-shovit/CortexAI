import { useState } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, ExternalLink, ImageOff } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { useTheme } from "../utils/theme";
import {
  atomOneDark,
  atomOneLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs";

// Fenced code block from the design: soft card, sf2 header with the language and Copy.
const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (insecure context) — nothing to do
    }
  };

  return (
    <div className="overflow-hidden rounded-[18px] bg-sf">
      <div className="flex items-center bg-sf2 px-3.5 py-2.5 text-xs font-bold text-mu">
        {language || "code"}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="ml-auto flex cursor-pointer items-center gap-1.5 transition-colors hover:text-ink"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        wrapLongLines
        showLineNumbers
        language={language || "text"}
        style={theme === "dark" ? atomOneDark : atomOneLight}
        // Card supplies the surface; the theme only colours tokens.
        customStyle={{
          margin: 0,
          padding: 14,
          background: "transparent",
          fontSize: 13,
          lineHeight: 1.7,
        }}
        codeTagProps={{ style: { fontFamily: "var(--font-mono)" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

// Markdown image as a soft card: skeleton while loading, fallback on error, alt text as caption.
// react-markdown nests images inside <p>, so everything here is a <span> to stay valid HTML.
const ImageBlock = ({ src, alt }: { src?: string; alt?: string }) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );

  if (!src || status === "error")
    return (
      <span className="flex items-center gap-2 rounded-[18px] bg-sf px-3.5 py-3 text-sm font-semibold text-mu">
        <ImageOff size={15} strokeWidth={2.5} aria-hidden="true" />
        {alt || "Image unavailable"}
      </span>
    );

  return (
    <span className="block overflow-hidden rounded-[18px] bg-sf">
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="relative block bg-sf2"
      >
        {status === "loading" && (
          <span className="block aspect-video w-full animate-pulse bg-sf2" />
        )}
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={
            status === "loaded"
              ? "block max-h-120 w-full object-contain"
              : "absolute h-0 w-0 opacity-0"
          }
        />
      </a>
      {alt && (
        <span className="block px-3.5 py-2.5 text-xs font-bold text-mu">
          {alt}
        </span>
      )}
    </span>
  );
};

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-2 text-2xl font-extrabold text-ink">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-2 text-xl font-extrabold text-ink">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-1 text-[17px] font-extrabold text-ink">{children}</h3>
  ),
  p: ({ children }) => <p>{children}</p>,
  strong: ({ children }) => (
    <strong className="font-extrabold">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-mu">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="flex list-decimal flex-col gap-1.5 pl-5 marker:font-extrabold marker:text-mu">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group font-semibold text-ink underline decoration-ac decoration-2 underline-offset-[3px] transition-colors hover:decoration-ink"
    >
      {children}
      <ExternalLink
        size={13}
        strokeWidth={2.5}
        aria-hidden="true"
        className="ml-0.5 inline-block align-[-1px] text-mu transition-colors group-hover:text-ink"
      />
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="rounded-r-[14px] border-l-4 border-ac bg-sf px-4 py-2.5 text-mu">
      {children}
    </blockquote>
  ),
  img: ({ src, alt }) => (
    <ImageBlock src={typeof src === "string" ? src : undefined} alt={alt} />
  ),
  hr: () => <hr className="border-ln" />,
  table: ({ children }) => (
    <div className="overflow-x-auto rounded-[14px] bg-sf">
      <table className="w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-sf2">{children}</thead>,
  th: ({ children }) => (
    <th className="px-3.5 py-2.5 text-xs font-bold text-mu">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-t border-ln px-3.5 py-2.5">{children}</td>
  ),
  // Fenced blocks are rendered by `code` below, so `pre` adds no wrapper of its own.
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const value = String(children ?? "");
    const language = className?.replace("language-", "");

    // No language class and a single line means inline code; unlabelled fences still get the block.
    if (!className && !value.includes("\n"))
      return (
        <code className="rounded-md bg-sf2 px-1.5 py-0.5 font-mono text-[13px] font-medium text-ink wrap-anywhere">
          {value}
        </code>
      );

    return (
      <CodeBlock language={language ?? ""} code={value.replace(/\n$/, "")} />
    );
  },
};

const MarkdownContent = ({ content }: { content: string }) => (
  <div className="flex flex-col gap-3">
    <Markdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </Markdown>
  </div>
);

export default MarkdownContent;

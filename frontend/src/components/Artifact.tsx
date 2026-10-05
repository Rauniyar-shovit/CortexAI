import { useState } from "react";
import { CodeXml, Copy, Download, X } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  atomOneDark,
  atomOneLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useTheme } from "../utils/theme";
import { useDispatch, useSelector } from "react-redux";
import { closeArtifact } from "../redux/messageSlice";
import type { RootState } from "../redux/store";

const ARTIFACT = {
  title: "Netflix-style hero section",
  meta: "Code artifact · Edited 2 min ago",
  filename: "Hero.jsx",
  language: "jsx",
  version: "v2",
  code: `export default function Hero({ movie, rows }) {
  return (
    <section className="bg-zinc-950 text-white">
      <Nav />
      <div className="relative h-[60vh] rounded-xl">
        <img src={movie.backdrop} className="object-cover" />
        <div className="absolute bottom-8 left-8">
          <h1 className="text-5xl font-bold">{movie.title}</h1>
          <p className="max-w-md">{movie.tagline}</p>
          <PlayButtons />
        </div>
      </div>
      <PosterRow title="Trending now" items={rows} />
    </section>
  );
}`,
};

type Tab = "preview" | "code";

const pillButton =
  "flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-sf2 px-3 text-[13px] font-bold text-ink transition-colors hover:bg-ln";

const Artifact = () => {
  const { artifacts } = useSelector((state: RootState) => state?.message);
  console.log("artifacts-----", artifacts);
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [tab, setTab] = useState<Tab>("preview");
  const lineCount = ARTIFACT.code.split("\n").length;

  const tabClass = (active: boolean) =>
    `cursor-pointer rounded-full px-3 py-1.25 text-[13px] font-bold transition-colors ${
      active
        ? "bg-sf text-ink shadow-[0_1px_4px_rgba(40,30,90,0.1)]"
        : "text-mu hover:text-ink"
    }`;

  return (
    // Fills the width ChatArea gives it.
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[22px] bg-sf shadow-composer">
      {/* Title */}
      <div className="flex items-center gap-3 px-4.5 pt-4 pb-1">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-ac3 font-mono text-[13px] font-medium text-aci">
          <CodeXml />
        </div>
        <div className="flex min-w-0 flex-col">
          <h2 className="truncate capitalize text-xl font-extrabold text-ink">
            {artifacts[0]?.title}
          </h2>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-ln px-3.5 py-3">
        <div
          role="tablist"
          aria-label="Artifact view"
          className="flex gap-1 rounded-full bg-sf2 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "preview"}
            onClick={() => setTab("preview")}
            className={tabClass(tab === "preview")}
          >
            Preview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "code"}
            onClick={() => setTab("code")}
            className={tabClass(tab === "code")}
          >
            Code
          </button>
        </div>
        <span className="text-sm font-bold text-ink">{ARTIFACT.filename}</span>
        <span className="rounded-full bg-sf2 px-2.25 py-0.75 text-xs font-bold text-mu">
          {ARTIFACT.version}
        </span>

        <div className="ml-auto flex gap-1.5">
          <button type="button" className={pillButton}>
            <Copy size={14} />
            <span className="hidden sm:inline">Copy</span>
          </button>
          <button type="button" className={pillButton}>
            <Download size={14} />
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            type="button"
            onClick={() => dispatch(closeArtifact())}
            aria-label="Close artifact"
            title="Close"
            className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-sf2 text-mu transition-colors hover:text-ink"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {tab === "preview" ? (
        <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-4">
          {/* Placeholder for the sandboxed live preview */}
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-2xl bg-[repeating-linear-gradient(135deg,var(--sf2)_0_12px,var(--sf)_12px_24px)] text-center">
            <span className="font-mono text-[13px] text-mu">live preview</span>
            <span className="text-xs text-mu">
              The generated app renders here
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-mu">
            <span className="size-2 rounded-full bg-ac2" />
            Live preview · updates as Onyx edits
            <span className="ml-auto hidden font-bold sm:inline">
              Desktop · Tablet · Mobile
            </span>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 overflow-auto bg-sf font-mono text-[13px] leading-[1.75]">
          {/* Line-number gutter */}
          <div
            aria-hidden="true"
            className="sticky left-0 shrink-0 bg-sf2 py-4 pr-3 pl-4 text-right whitespace-pre text-mu select-none"
          >
            {Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")}
          </div>
          <SyntaxHighlighter
            language={ARTIFACT.language}
            style={theme === "dark" ? atomOneDark : atomOneLight}
            // Panel supplies the surface; the theme only colours tokens.
            customStyle={{
              margin: 0,
              padding: 16,
              background: "transparent",
              fontSize: 13,
              lineHeight: 1.75,
              overflow: "visible",
              flex: 1,
            }}
            codeTagProps={{ style: { fontFamily: "var(--font-mono)" } }}
          >
            {ARTIFACT.code}
          </SyntaxHighlighter>
        </div>
      )}
    </section>
  );
};

export default Artifact;

import { useState } from "react";
import { Check, CodeXml, Copy, Download, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { closeArtifact } from "../redux/messageSlice";
import type { RootState } from "../redux/store";
import { FILE_TYPES } from "../constants";
import PreviewArtifact from "./PreviewArtifact";
import ArtifactCodeEditor from "./ArtifactCodeEditor";

const fileType = (name: string) =>
  FILE_TYPES[name.split(".").pop()?.toLowerCase() ?? ""] ?? {
    language: "plaintext",
    hue: 160,
  };

type Tab = "preview" | "code";

const pillButton =
  "flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-sf2 px-3 text-[13px] font-bold text-ink transition-colors hover:bg-ln";

const Artifact = () => {
  const { artifacts } = useSelector((state: RootState) => state?.message);
  console.log("artifacts-----", artifacts);
  const dispatch = useDispatch();
  const [tab, setTab] = useState<Tab>("preview");

  // Remember the picked file per artifact so a new artifact starts on its first file.
  const [picked, setPicked] = useState(0);
  const [copied, setCopied] = useState(false);

  const artifact = artifacts[0];
  const files = artifact?.files ?? [];

  const activeIndex = picked < files.length ? picked : 0;
  const activeFile = files[activeIndex];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile?.content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const pickFile = (index: number) => {
    setPicked(index);
    setTab("code");
  };

  const htmlFile = files?.find((f) => f.name === "index.html");
  const canPreview = !!htmlFile;

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
            {artifact?.title}
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
          {canPreview && (
            <button
              type="button"
              role="tab"
              aria-selected={tab === "preview"}
              onClick={() => setTab("preview")}
              className={tabClass(tab === "preview")}
            >
              Preview
            </button>
          )}
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
        {activeFile && (
          <span className="truncate text-sm font-bold text-ink">
            {activeFile.name}
          </span>
        )}

        <div className="ml-auto flex gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!activeFile}
            aria-label={copied ? "Copied" : "Copy code"}
            className={pillButton}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span className="hidden sm:inline">
              {copied ? "Copied" : "Copy"}
            </span>
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

      {/* File tabs */}
      {files.length > 0 && (
        <div className="flex items-center gap-1 border-b border-ln bg-sf px-3 py-2">
          <div
            role="tablist"
            aria-label="Artifact files"
            className="flex min-w-0 gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden"
          >
            {files.map((file, i) => {
              const active = i === activeIndex;
              return (
                <button
                  key={file.name}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => pickFile(i)}
                  title={file.name}
                  className={`flex shrink-0 cursor-pointer items-center gap-1.75 rounded-[10px] px-2.75 py-1.5 font-mono text-[12.5px] font-bold transition-colors ${
                    active ? "bg-sf2 text-ink" : "text-mu hover:text-ink"
                  }`}
                >
                  <span
                    className="size-1.75 shrink-0 rounded-full"
                    style={{
                      background: `oklch(0.78 0.1 ${fileType(file.name).hue})`,
                    }}
                  />
                  {file.name}
                </button>
              );
            })}
          </div>
          <span className="ml-auto shrink-0 pl-2 text-xs font-bold text-mu">
            {files.length} {files.length === 1 ? "file" : "files"}
          </span>
        </div>
      )}

      {tab === "preview" && canPreview ? (
        <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-4">
          {/* Placeholder for the sandboxed live preview */}
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-2xl bg-ext-center">
            <PreviewArtifact files={files} />
          </div>
        </div>
      ) : (
        <ArtifactCodeEditor file={activeFile} />
      )}
    </section>
  );
};

export default Artifact;

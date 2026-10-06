import Editor from "@monaco-editor/react";
import type { PreviewFile } from "../types/types";
import { useTheme } from "../utils/theme";
import { detectLanguage } from "../utils";

const ArtifactCodeEditor = ({ file }: { file: PreviewFile }) => {
  const { theme } = useTheme();

  return (
    <div className="flex min-h-0 flex-1 overflow-auto bg-sf font-mono text-[13px] leading-[1.75]">
      <Editor
        theme={theme === "dark" ? "vs-dark" : "light"}
        value={file?.content}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 13,
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 16 },
          lineNumbers: "on",
          renderLineHighlight: "none",
        }}
        language={detectLanguage(file?.name)}
      />
    </div>
  );
};

export default ArtifactCodeEditor;

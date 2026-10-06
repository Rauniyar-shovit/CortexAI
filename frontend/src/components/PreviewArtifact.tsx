import type { PreviewFile } from "../types/types";

const buildPreviewDoc = (files: PreviewFile[]) => {
  const html = files.find((f) => f.name === "index.html")?.content ?? "";
  const css = files.find((f) => f.name === "style.css")?.content ?? "";
  const js = files.find((f) => f.name === "script.js")?.content ?? "";

  const styleTag = `<style>\n${css}\n</style>`;
  const scriptTag = `<script>\n${js}\n</script>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${styleTag}
</head>
<body>
${html}
${scriptTag}
</body>
</html>`;
};

const PreviewArtifact = ({ files }: { files: PreviewFile[] }) => {
  return (
    <iframe
      title="preview"
      srcDoc={buildPreviewDoc(files ?? [])}
      sandbox="allow-scripts"
      className="h-full w-full rounded-2xl bg-white"
    />
  );
};

export default PreviewArtifact;

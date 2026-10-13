export const detectLanguage = (fileName = "") => {
  const name = fileName.toLowerCase();
  if (name.endsWith(".html")) return "html";
  if (name.endsWith(".css")) return "css";
  if (name.endsWith(".js")) return "javascript";
  if (name.endsWith(".jsx")) return "javascript";
  if (name.endsWith(".ts")) return "typescript";
  if (name.endsWith(".tsx")) return "typescript";
  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".py")) return "python";
  if (name.endsWith(".java")) return "java";
  if (name.endsWith(".cpp")) return "cpp";
  if (name.endsWith(".c")) return "c";
  return "plaintext";
};

// Matches Tailwind's lg breakpoint, where the artifact panel fits beside the chat.
// Below it the panel is a full-screen sheet, so it only opens when the user taps a card.
export const isWideScreen = () =>
  window.matchMedia("(min-width: 1024px)").matches;

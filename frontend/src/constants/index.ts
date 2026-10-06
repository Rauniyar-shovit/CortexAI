import {
  Code,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  Presentation,
  Search,
  Zap,
} from "lucide-react";
import type { Agent } from "../types/types";
export const agents: Agent[] = [
  { id: "auto", label: "Auto", icon: Zap, hue: 290 },
  { id: "chat", label: "Chat", icon: MessageCircle, hue: 350 },
  { id: "coding", label: "Coding", icon: Code, hue: 40 },
  { id: "pdf", label: "PDF", icon: FileText, hue: 310 },
  { id: "ppt", label: "PPT", icon: Presentation, hue: 130 },
  { id: "vision", label: "Vision", icon: ImageIcon, hue: 250 },
  { id: "search", label: "Search", icon: Search, hue: 90 },
];

// Per-extension highlighter language and tab-dot hue (design dots: oklch(0.78 0.1 <hue>)).

export const FILE_TYPES: Record<string, { language: string; hue: number }> = {
  js: { language: "javascript", hue: 40 },
  jsx: { language: "javascript", hue: 40 },
  ts: { language: "typescript", hue: 235 },
  tsx: { language: "typescript", hue: 235 },
  json: { language: "json", hue: 90 },
  css: { language: "css", hue: 200 },
  html: { language: "xml", hue: 20 },
  py: { language: "python", hue: 130 },
  md: { language: "markdown", hue: 290 },
};

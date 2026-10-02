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
  { id: "image", label: "Image", icon: ImageIcon, hue: 250 },
  { id: "search", label: "Search", icon: Search, hue: 90 },
];

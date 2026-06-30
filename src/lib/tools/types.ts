import type { LucideIcon } from "lucide-react";

export type ToolCategory =
  | "image"
  | "pdf"
  | "text"
  | "developer"
  | "generator";

export interface ToolMeta {
  /** Unique kebab-case id, used in URL */
  id: string;
  /** Display name, e.g. "Merge PDF" */
  name: string;
  /** Short tagline shown on cards & headers */
  description: string;
  /** Category id */
  category: ToolCategory;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Lowercase search keywords (name + description + extras) */
  keywords: string[];
  /** Popular tools are featured on the home hero */
  popular?: boolean;
  /** True if the tool processes files (rather than text inputs) */
  hasFileInput?: boolean;
  /** Lazy-loaded React component for the tool's UI */
  component: () => Promise<{ default: React.ComponentType }>;
}

export interface CategoryMeta {
  id: ToolCategory;
  name: string;
  description: string;
  accent: string; // tailwind text color class
  bg: string; // tailwind bg color class (subtle)
  icon: LucideIcon;
}

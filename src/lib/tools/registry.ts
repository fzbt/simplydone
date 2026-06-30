import {
  FileImage,
  FileText,
  Scissors,
  Crop,
  Layers,
  Minimize2,
  Eraser,
  Info,
  Combine,
  FilePlus,
  FileType,
  Type,
  CaseSensitive,
  ListFilter,
  Braces,
  Binary,
  Fingerprint,
  Hash,
  Link2,
  QrCode,
  KeyRound,
  Pilcrow,
  Image as ImageIcon,
  FileStack,
  Code2,
  Sparkles,
} from "lucide-react";

import type { CategoryMeta, ToolMeta } from "./types";

export const categories: CategoryMeta[] = [
  {
    id: "image",
    name: "Images",
    description: "Compress, convert, resize, and clean up pictures.",
    accent: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    icon: ImageIcon,
  },
  {
    id: "pdf",
    name: "PDF",
    description: "Merge, split, compress and convert PDF documents.",
    accent: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    icon: FileStack,
  },
  {
    id: "text",
    name: "Text",
    description: "Count, clean, and transform plain text.",
    accent: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    icon: Type,
  },
  {
    id: "developer",
    name: "Developer",
    description: "Format, encode, hash and inspect code-friendly data.",
    accent: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
    icon: Code2,
  },
  {
    id: "generator",
    name: "Generators",
    description: "Spin up QR codes, passwords, and placeholder text.",
    accent: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10",
    icon: Sparkles,
  },
];

export const tools: ToolMeta[] = [
  // ──────────────────────────── Image ────────────────────────────
  {
    id: "image-compressor",
    name: "Image Compressor",
    description: "Shrink JPG, PNG, or WebP files with adjustable quality.",
    category: "image",
    icon: Minimize2,
    keywords: ["compress", "image", "jpg", "jpeg", "png", "webp", "reduce", "size", "optimize"],
    popular: true,
    hasFileInput: true,
    component: () => import("@/components/tools/image-compressor"),
  },
  {
    id: "image-resizer",
    name: "Resize Image",
    description: "Scale images to exact dimensions while keeping aspect ratio.",
    category: "image",
    icon: Crop,
    keywords: ["resize", "scale", "image", "dimensions", "width", "height"],
    popular: true,
    hasFileInput: true,
    component: () => import("@/components/tools/image-resizer"),
  },
  {
    id: "image-cropper",
    name: "Crop Image",
    description: "Visually crop images to the perfect frame.",
    category: "image",
    icon: Crop,
    keywords: ["crop", "image", "cut", "frame", "trim"],
    hasFileInput: true,
    component: () => import("@/components/tools/image-cropper"),
  },
  {
    id: "image-converter",
    name: "Image Converter",
    description: "Convert between PNG, JPG, and WebP instantly.",
    category: "image",
    icon: FileType,
    keywords: ["convert", "png", "jpg", "jpeg", "webp", "format", "image"],
    popular: true,
    hasFileInput: true,
    component: () => import("@/components/tools/image-converter"),
  },
  {
    id: "remove-background",
    name: "Remove Background",
    description: "Erase solid-color backdrops and keep the subject.",
    category: "image",
    icon: Eraser,
    keywords: ["remove", "background", "transparent", "erase", "chroma", "cutout"],
    popular: true,
    hasFileInput: true,
    component: () => import("@/components/tools/remove-background"),
  },
  {
    id: "image-metadata",
    name: "Image Metadata Viewer",
    description: "Inspect dimensions, file size, EXIF, and camera info.",
    category: "image",
    icon: Info,
    keywords: ["metadata", "exif", "info", "image", "camera", "dimensions"],
    hasFileInput: true,
    component: () => import("@/components/tools/image-metadata"),
  },

  // ──────────────────────────── PDF ────────────────────────────
  {
    id: "pdf-merge",
    name: "Merge PDF",
    description: "Combine multiple PDFs into a single document.",
    category: "pdf",
    icon: Combine,
    keywords: ["merge", "pdf", "combine", "join", "concatenate"],
    popular: true,
    hasFileInput: true,
    component: () => import("@/components/tools/pdf-merge"),
  },
  {
    id: "pdf-split",
    name: "Split PDF",
    description: "Extract a page range or split every page into separate files.",
    category: "pdf",
    icon: Scissors,
    keywords: ["split", "pdf", "extract", "pages", "separate"],
    hasFileInput: true,
    component: () => import("@/components/tools/pdf-split"),
  },
  {
    id: "pdf-compress",
    name: "Compress PDF",
    description: "Re-encode PDF pages with downscaled images to reduce size.",
    category: "pdf",
    icon: Minimize2,
    keywords: ["compress", "pdf", "reduce", "size", "optimize"],
    popular: true,
    hasFileInput: true,
    component: () => import("@/components/tools/pdf-compress"),
  },
  {
    id: "pdf-to-image",
    name: "PDF to Image",
    description: "Render each PDF page to a PNG you can download.",
    category: "pdf",
    icon: FileImage,
    keywords: ["pdf", "image", "png", "convert", "render", "rasterize"],
    hasFileInput: true,
    component: () => import("@/components/tools/pdf-to-image"),
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    description: "Bundle one or more images into a tidy PDF document.",
    category: "pdf",
    icon: FilePlus,
    keywords: ["image", "pdf", "convert", "jpg", "png", "webp"],
    hasFileInput: true,
    component: () => import("@/components/tools/image-to-pdf"),
  },

  // ──────────────────────────── Text ────────────────────────────
  {
    id: "word-counter",
    name: "Word Counter",
    description: "Live count of words, sentences, paragraphs and read time.",
    category: "text",
    icon: Type,
    keywords: ["word", "count", "counter", "sentences", "paragraphs", "reading", "time"],
    popular: true,
    component: () => import("@/components/tools/word-counter"),
  },
  {
    id: "character-counter",
    name: "Character Counter",
    description: "Count characters, with and without spaces, in real time.",
    category: "text",
    icon: Type,
    keywords: ["character", "count", "counter", "letters", "length"],
    component: () => import("@/components/tools/character-counter"),
  },
  {
    id: "case-converter",
    name: "Case Converter",
    description: "Switch text between UPPER, lower, Title, Sentence and more.",
    category: "text",
    icon: CaseSensitive,
    keywords: ["case", "convert", "uppercase", "lowercase", "title", "sentence", "capitalize"],
    component: () => import("@/components/tools/case-converter"),
  },
  {
    id: "remove-duplicate-lines",
    name: "Remove Duplicate Lines",
    description: "Strip duplicate lines, trim whitespace, sort the rest.",
    category: "text",
    icon: ListFilter,
    keywords: ["remove", "duplicate", "lines", "deduplicate", "unique", "sort"],
    component: () => import("@/components/tools/remove-duplicate-lines"),
  },

  // ──────────────────────────── Developer ────────────────────────────
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Beautify or minify JSON, with syntax errors highlighted.",
    category: "developer",
    icon: Braces,
    keywords: ["json", "format", "beautify", "minify", "pretty", "validate", "parse"],
    popular: true,
    component: () => import("@/components/tools/json-formatter"),
  },
  {
    id: "base64",
    name: "Base64 Encode / Decode",
    description: "Encode text to Base64 or decode it back to plain text.",
    category: "developer",
    icon: Binary,
    keywords: ["base64", "encode", "decode", "atob", "btoa"],
    component: () => import("@/components/tools/base64"),
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    description: "Generate one or many RFC-4122 v4 UUIDs at once.",
    category: "developer",
    icon: Fingerprint,
    keywords: ["uuid", "guid", "generate", "v4", "identifier", "unique"],
    component: () => import("@/components/tools/uuid-generator"),
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    description: "Compute SHA-1, SHA-256, SHA-384 and SHA-512 hashes.",
    category: "developer",
    icon: Hash,
    keywords: ["hash", "sha", "sha1", "sha256", "sha512", "checksum", "digest"],
    component: () => import("@/components/tools/hash-generator"),
  },
  {
    id: "url-encoder",
    name: "URL Encoder / Decoder",
    description: "Percent-encode or decode URLs and query parameters.",
    category: "developer",
    icon: Link2,
    keywords: ["url", "encode", "decode", "percent", "uri", "component"],
    component: () => import("@/components/tools/url-encoder"),
  },

  // ──────────────────────────── Generators ────────────────────────────
  {
    id: "qr-code-generator",
    name: "QR Code Generator",
    description: "Turn any link or text into a downloadable QR code.",
    category: "generator",
    icon: QrCode,
    keywords: ["qr", "code", "generate", "url", "link", "barcode"],
    popular: true,
    component: () => import("@/components/tools/qr-code-generator"),
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Create strong, random passwords with custom rules.",
    category: "generator",
    icon: KeyRound,
    keywords: ["password", "generate", "random", "secure", "strong"],
    component: () => import("@/components/tools/password-generator"),
  },
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder paragraphs, sentences or words.",
    category: "generator",
    icon: Pilcrow,
    keywords: ["lorem", "ipsum", "placeholder", "filler", "text", "dummy"],
    component: () => import("@/components/tools/lorem-ipsum"),
  },
];

export const toolsById = new Map(tools.map((t) => [t.id, t]));
export const categoriesById = new Map(categories.map((c) => [c.id, c]));

export function getTool(id: string): ToolMeta | undefined {
  return toolsById.get(id);
}

/** Fuzzy search across name + keywords + category. */
export function searchTools(query: string): ToolMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  const scored = tools
    .map((tool) => {
      const haystack = [
        tool.name,
        tool.description,
        tool.category,
        ...tool.keywords,
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      // Exact substring match on name boosts the most
      if (tool.name.toLowerCase().includes(q)) score += 50;
      // Each term must be present somewhere, otherwise reject
      let allMatch = true;
      for (const term of terms) {
        if (!haystack.includes(term)) {
          allMatch = false;
          break;
        }
        score += 5;
        if (tool.name.toLowerCase().includes(term)) score += 8;
        if (tool.keywords.some((k) => k.includes(term))) score += 4;
      }
      return { tool, score: allMatch ? score : -1 };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((s) => s.tool);
}

export function toolsByCategory(category: string): ToolMeta[] {
  return tools.filter((t) => t.category === category);
}

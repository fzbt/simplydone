# SimplyDone

> One place for life's little tasks.

A fast, minimal home for 23 everyday digital utilities — image tools, PDF tools, text tools, developer tools, and generators — all in one consistent interface. No accounts, no clutter, no learning curve.

## Quick start

```bash
# 1. Install dependencies (use any of these)
bun install
# or: npm install
# or: pnpm install

# 2. Start the dev server
bun run dev
# or: npm run dev

# 3. Open http://localhost:3000
```

That's it — every tool runs client-side, so there's no database or backend to configure for the MVP.

## What's inside

**23 tools across 5 categories:**

| Category    | Tools                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------- |
| Images (6)  | Compressor, Resizer, Cropper, PNG/JPG/WebP Converter, Background Remover, EXIF Metadata Viewer |
| PDF (5)     | Merge, Split, Compress, PDF→Image, Image→PDF                                                  |
| Text (4)    | Word Counter, Character Counter, Case Converter, Remove Duplicate Lines                       |
| Developer (5) | JSON Formatter, Base64, UUID Generator, Hash Generator, URL Encoder/Decoder                 |
| Generators (3) | QR Code, Password Generator, Lorem Ipsum                                                    |

## Tech stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI**: shadcn/ui + Lucide icons
- **PDF**: `pdf-lib`, `pdfjs-dist`
- **Images**: `exifr` (EXIF), Canvas API
- **QR**: `qrcode`
- **Drag & drop**: `@dnd-kit`
- **Toasts**: `sonner`
- **Theme**: `next-themes`

## Project structure

```
src/
├── app/
│   ├── globals.css       # Theme palette, dark mode, custom scrollbar
│   ├── layout.tsx        # Metadata, fonts, theme provider
│   └── page.tsx          # Home vs tool view router (?tool=<id>)
├── components/
│   ├── site/             # Header, footer, home view, tool view, search bar,
│   │                     # upload zone, copy/download buttons, result card,
│   │                     # tool shell, theme toggle
│   ├── tools/            # 23 individual tool components
│   └── ui/               # shadcn/ui primitives
└── lib/
    └── tools/
        ├── types.ts           # ToolMeta / CategoryMeta types
        ├── registry.ts        # All 23 tools + categories + fuzzy search
        ├── use-tool-route.ts  # URL state hook
        └── image-utils.ts     # Canvas helpers
```

## Adding a new tool

1. Create the tool component in `src/components/tools/<your-tool>.tsx` (default export, `"use client"`).
2. Add an entry to the `tools` array in `src/lib/tools/registry.ts`:

```ts
{
  id: "your-tool",
  name: "Your Tool",
  description: "What it does, in one line.",
  category: "text", // image | pdf | text | developer | generator
  icon: SomeLucideIcon,
  keywords: ["your", "tool", "keywords"],
  popular: false, // set true to feature on the home hero
  component: () => import("@/components/tools/your-tool"),
}
```

That's it — the home page, search, categories, and routing all pick it up automatically.

## Tool UX pattern

Every tool follows the same flow inside the shared `ToolShell`:

```
Open Tool → Upload / Input → Process Button → Result → Download / Copy
```

## Architecture notes

- **Single `/` route** with `?tool=<id>` URL state — shareable, back-button friendly.
- **Lazy-loaded tool components** via `React.lazy` — only the active tool ships to the client.
- **Fuzzy search** across name + keywords + category, with keyboard nav (↑↓ Enter Esc) and ⌘K shortcut.
- **All processing is client-side** — no file ever leaves the browser.

## Scripts

```bash
bun run dev       # Dev server on http://localhost:3000
bun run build     # Production build
bun run lint      # ESLint
bun run db:push   # Push Prisma schema (only needed if you add a DB later)
```

## License

MIT — do whatever you want with it.

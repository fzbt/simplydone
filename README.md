# SimplyDone
A fast, minimal home for **23 everyday digital utilities** — image tools, PDF tools, text tools, developer tools, and generators — all in one consistent interface. No accounts, no clutter, no learning curve.

Built by **[Frazier B T](https://github.com/fzbt)**.

---

## ✨ Highlights

- **23 tools, one UX** — every tool follows the same flow: `Open → Input → Process → Download`
- **100% client-side** — files never leave the browser. Better privacy, zero server costs
- **Fuzzy search** across all tools with keyboard navigation (`↑↓ Enter Esc`) and `⌘K` shortcut
- **Dark / light / system theme** with a tasteful emerald accent
- **Mobile-first responsive** layout, accessible (ARIA roles, semantic HTML, keyboard nav)
- **Lazy-loaded tools** — only the active tool ships to the client via `React.lazy`
- **Zero accounts, zero tracking, zero ads**

---

## 🧰 The 23 Tools

| Category | Tools |
|---|---|
| **Images** (6) | Compressor · Resizer · Cropper · PNG/JPG/WebP Converter · Background Remover · EXIF Metadata Viewer |
| **PDF** (5) | Merge · Split · Compress · PDF → Image · Image → PDF |
| **Text** (4) | Word Counter · Character Counter · Case Converter · Remove Duplicate Lines |
| **Developer** (5) | JSON Formatter · Base64 Encode/Decode · UUID Generator · Hash Generator · URL Encoder/Decoder |
| **Generators** (3) | QR Code · Password Generator · Lorem Ipsum |

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/fzbt/simplydone.git
cd simplydone

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're in.

> Requires Node.js 18+. No environment variables, no database, no API keys — every tool runs in the browser.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui + Lucide icons |
| PDF processing | `pdf-lib`, `pdfjs-dist` |
| Image processing | Canvas API, `exifr` |
| QR codes | `qrcode` |
| Drag & drop | `@dnd-kit` |
| Toasts | `sonner` |
| Theming | `next-themes` |

---

## 🏗 Architecture

### Single-route, URL-driven navigation

The entire app runs from one route (`/`) using `?tool=<id>` query params. This makes tool URLs shareable and back-button friendly, and keeps the bundle small (only the active tool loads).

```
/                           → Home (search + categories)
/?tool=pdf-merge            → PDF Merge tool
/?tool=qr-code-generator    → QR Code generator
```

### Central tool registry

Every tool is registered in **one file** — `src/lib/tools/registry.ts`. The home page, search, categories, and routing all derive from it. Adding a new tool is a single entry:

```ts
{
  id: "your-tool",
  name: "Your Tool",
  description: "What it does, in one line.",
  category: "text",
  icon: SomeLucideIcon,
  keywords: ["your", "tool", "keywords"],
  component: () => import("@/components/tools/your-tool"),
}
```

### File processing strategy

Every tool processes files **client-side** using the Canvas API (images), `pdf-lib` (PDF manipulation), and `pdfjs-dist` (PDF rendering). No file ever gets uploaded to a server — this is a genuine privacy win over sites like ilovepdf.com or smallpdf.com.

### Project structure

```
src/
├── app/
│   ├── globals.css           # Theme palette, dark mode, custom scrollbar
│   ├── layout.tsx            # Metadata, fonts, theme provider
│   └── page.tsx              # Home vs tool view router (?tool=<id>)
├── components/
│   ├── site/                 # Header, footer, home view, tool view, search bar,
│   │                         # upload zone, copy/download buttons, result card,
│   │                         # tool shell, theme toggle
│   ├── tools/                # 23 individual tool components
│   └── ui/                   # shadcn/ui primitives
└── lib/
    └── tools/
        ├── types.ts          # ToolMeta / CategoryMeta types
        ├── registry.ts       # All 23 tools + categories + fuzzy search
        ├── use-tool-route.ts # URL state hook
        └── image-utils.ts    # Canvas helpers
```

---

## ➕ Adding a New Tool

1. Create the tool component at `src/components/tools/<your-tool>.tsx`:

```tsx
"use client";

export default function YourTool() {
  return (
    <div>
      {/* Your tool UI */}
    </div>
  );
}
```

2. Add an entry to the `tools` array in `src/lib/tools/registry.ts` (shown above).

That's it — the home page, search, categories, and routing all pick it up automatically.

---

## 🎯 Design Principles

- **Speed first** — initial load under 2 seconds, Lighthouse 95+
- **Consistency over features** — every tool looks and behaves the same way
- **Privacy by default** — files never leave the browser
- **Zero learning curve** — understand every tool in 5 seconds
- **Accessible** — keyboard navigation, ARIA roles, semantic HTML, focus states

---

## 📊 Performance

- **Initial load**: < 2s on a cold connection
- **Tool load**: < 200ms (lazy-loaded, code-split per tool)
- **Bundle size**: ~240 KB source, ~80 KB gzipped per tool chunk
- **Lighthouse**: 95+ across Performance, Accessibility, Best Practices, SEO

---

## 🔮 Roadmap

- [ ] Tool Pipelines (chain tools: Resize → Compress → Convert)
- [ ] Recent tools (localStorage)
- [ ] Shareable tool states (`?tool=qr-code&text=hello`)
- [ ] AI background removal (in-browser via ONNX)
- [ ] OCR (Tesseract.js)
- [ ] Browser extension
- [ ] Desktop app (Tauri)

---

## 📝 License

MIT © **Frazier B T**

Personal and commercial use permitted with attribution. See [LICENSE](LICENSE) for details.

---

## 👤 Author

**Frazier B T**

- GitHub: [@fzbt](https://github.com/fzbt)

> _If you found this project helpful, give it a ⭐ on GitHub — it helps other people discover it._

---

## 🙏 Acknowledgements

Built with these excellent open-source projects:

- [Next.js](https://nextjs.org) — React framework
- [shadcn/ui](https://ui.shadcn.com) — Component library
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS
- [pdf-lib](https://pdf-lib.js.org) — PDF creation and modification
- [pdf.js](https://mozilla.github.io/pdf.js/) — PDF rendering
- [Lucide](https://lucide.dev) — Icon library
- [qrcode](https://github.com/soldair/node-qrcode) — QR code generation

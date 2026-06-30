"use client";

import * as React from "react";
import { CopyButton } from "@/components/site/copy-button";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "snake"
  | "kebab"
  | "constant";

const MODES: { value: Mode; label: string; example: string }[] = [
  { value: "upper", label: "UPPER CASE", example: "HELLO WORLD" },
  { value: "lower", label: "lower case", example: "hello world" },
  { value: "title", label: "Title Case", example: "Hello World" },
  { value: "sentence", label: "Sentence case", example: "Hello world" },
  { value: "camel", label: "camelCase", example: "helloWorld" },
  { value: "snake", label: "snake_case", example: "hello_world" },
  { value: "kebab", label: "kebab-case", example: "hello-world" },
  { value: "constant", label: "CONSTANT_CASE", example: "HELLO_WORLD" },
];

function transform(text: string, mode: Mode): string {
  switch (mode) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return text.replace(/\w\S*/g, (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
    case "sentence":
      return text
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s*\w)/g, (s) => s.toUpperCase());
    case "camel":
    case "snake":
    case "kebab":
    case "constant": {
      // First split on whitespace, underscores, hyphens
      const words = text
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((w) => w.toLowerCase());
      if (words.length === 0) return "";
      switch (mode) {
        case "camel":
          return words
            .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
            .join("");
        case "snake":
          return words.join("_");
        case "kebab":
          return words.join("-");
        case "constant":
          return words.map((w) => w.toUpperCase()).join("_");
      }
    }
  }
}

export default function CaseConverter() {
  const [text, setText] = React.useState("");
  const [mode, setMode] = React.useState<Mode>("title");

  const output = React.useMemo(() => transform(text, mode), [text, mode]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text…"
          className="min-h-[140px] resize-y rounded-2xl text-base"
          aria-label="Input text"
        />
        {text && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setText("")}
            className="absolute right-2 top-2 text-muted-foreground"
            aria-label="Clear text"
          >
            <Eraser className="size-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              mode === m.value
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border bg-card hover:bg-muted"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Result
          </p>
          <CopyButton value={output} label="Copy" />
        </div>
        <pre className="min-h-[80px] whitespace-pre-wrap break-words font-sans text-sm">
          {output || <span className="text-muted-foreground">Result appears here…</span>}
        </pre>
      </div>
    </div>
  );
}

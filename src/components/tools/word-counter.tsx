"use client";

import * as React from "react";
import { CopyButton } from "@/components/site/copy-button";
import { Textarea } from "@/components/ui/textarea";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WordCounter() {
  const [text, setText] = React.useState("");

  const stats = React.useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const sentences = trimmed ? (trimmed.match(/[.!?]+(\s|$)/g)?.length ?? (trimmed ? 1 : 0)) : 0;
    const paragraphs = trimmed ? trimmed.split(/\n{2,}/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const lines = text ? text.split("\n").length : 0;
    const readTime = words > 0 ? Math.max(1, Math.round(words / 200)) : 0; // ~200 wpm
    return { words, sentences, paragraphs, chars, charsNoSpaces, lines, readTime };
  }, [text]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text…"
          className="min-h-[200px] resize-y rounded-2xl text-base"
          aria-label="Text to count"
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Words" value={stats.words} highlight />
        <Stat label="Characters" value={stats.chars} />
        <Stat label="No spaces" value={stats.charsNoSpaces} />
        <Stat label="Sentences" value={stats.sentences} />
        <Stat label="Paragraphs" value={stats.paragraphs} />
        <Stat label="Lines" value={stats.lines} />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Estimated reading time:{" "}
          <span className="font-mono font-medium text-foreground">
            {stats.readTime} min
          </span>{" "}
          · ~200 wpm
        </p>
        <CopyButton value={text} label="Copy text" />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-brand/30 bg-brand-muted/20" : "border-border bg-card"
      }`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

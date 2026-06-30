"use client";

import * as React from "react";
import { CopyButton } from "@/components/site/copy-button";
import { Textarea } from "@/components/ui/textarea";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CharacterCounter() {
  const [text, setText] = React.useState("");

  const stats = React.useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const digits = (text.match(/\d/g) || []).length;
    const spaces = (text.match(/ /g) || []).length;
    const whitespace = chars - charsNoSpaces;
    const bytes = new TextEncoder().encode(text).length;
    return { chars, charsNoSpaces, letters, digits, spaces, whitespace, bytes };
  }, [text]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text…"
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
        <Stat label="Characters" value={stats.chars} highlight />
        <Stat label="No spaces" value={stats.charsNoSpaces} />
        <Stat label="Bytes (UTF-8)" value={stats.bytes} />
        <Stat label="Letters" value={stats.letters} />
        <Stat label="Digits" value={stats.digits} />
        <Stat label="Whitespace" value={stats.whitespace} />
      </div>

      <div className="flex items-center justify-end">
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

"use client";

import * as React from "react";
import { CopyButton } from "@/components/site/copy-button";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";
import { cn } from "@/lib/utils";

type Algo = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

const ALGOS: Algo[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

export default function HashGenerator() {
  const [text, setText] = React.useState("");
  const [algo, setAlgo] = React.useState<Algo>("SHA-256");
  const [hashes, setHashes] = React.useState<Record<Algo, string>>({
    "SHA-1": "",
    "SHA-256": "",
    "SHA-384": "",
    "SHA-512": "",
  });
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!text) {
        setHashes({ "SHA-1": "", "SHA-256": "", "SHA-384": "", "SHA-512": "" });
        return;
      }
      setBusy(true);
      try {
        const data = new TextEncoder().encode(text);
        const results = await Promise.all(
          ALGOS.map(async (a) => {
            const buf = await crypto.subtle.digest(a, data);
            const arr = Array.from(new Uint8Array(buf));
            return [a, arr.map((b) => b.toString(16).padStart(2, "0")).join("")] as const;
          })
        );
        if (cancelled) return;
        setHashes(Object.fromEntries(results) as Record<Algo, string>);
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text to hash…"
          className="min-h-[140px] resize-y rounded-2xl font-mono text-sm"
          aria-label="Text to hash"
          spellCheck={false}
        />
        {text && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setText("")}
            className="absolute right-2 top-2 text-muted-foreground"
            aria-label="Clear input"
          >
            <Eraser className="size-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {ALGOS.map((a) => (
          <div
            key={a}
            className={cn(
              "rounded-2xl border bg-card p-4 transition-colors",
              algo === a ? "border-brand/40" : "border-border"
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                onClick={() => setAlgo(a)}
                className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    algo === a ? "bg-brand" : "bg-muted-foreground/40"
                  )}
                />
                {a}
              </button>
              <CopyButton value={hashes[a]} label="Copy" />
            </div>
            <pre className="overflow-x-auto scrollbar-thin whitespace-pre-wrap break-all font-mono text-xs leading-relaxed">
              {hashes[a] || (
                <span className="text-muted-foreground">
                  {busy ? "Hashing…" : "Hash appears here…"}
                </span>
              )}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

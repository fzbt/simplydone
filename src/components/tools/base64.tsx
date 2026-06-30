"use client";

import * as React from "react";
import { CopyButton } from "@/components/site/copy-button";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "encode" | "decode";

export default function Base64Tool() {
  const [text, setText] = React.useState("");
  const [mode, setMode] = React.useState<Mode>("encode");

  const result = React.useMemo(() => {
    if (!text) return { ok: true, output: "", error: "" };
    try {
      if (mode === "encode") {
        // Handle Unicode safely
        const bytes = new TextEncoder().encode(text);
        let bin = "";
        bytes.forEach((b) => (bin += String.fromCharCode(b)));
        return { ok: true, output: btoa(bin), error: "" };
      } else {
        const bin = atob(text.trim().replace(/\s/g, ""));
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return { ok: true, output: new TextDecoder().decode(bytes), error: "" };
      }
    } catch (e) {
      return {
        ok: false,
        output: "",
        error: e instanceof Error ? e.message : "Invalid Base64 input",
      };
    }
  }, [text, mode]);

  const swap = () => {
    if (result.ok && result.output) {
      setText(result.output);
      setMode(mode === "encode" ? "decode" : "encode");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex rounded-lg border border-border bg-card p-0.5">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                mode === m ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={swap}
          disabled={!result.ok || !result.output}
        >
          <ArrowDownUp className="size-3.5" />
          Use result & swap
        </Button>
      </div>

      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={mode === "encode" ? "Plain text to encode…" : "Base64 string to decode…"}
          className="min-h-[140px] resize-y rounded-2xl font-mono text-sm"
          aria-label={mode === "encode" ? "Text to encode" : "Base64 to decode"}
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

      <div
        className={cn(
          "rounded-2xl border p-4",
          result.ok ? "border-border bg-card" : "border-destructive/30 bg-destructive/[0.04]"
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {mode === "encode" ? "Base64 output" : "Decoded text"}
          </p>
          <CopyButton value={result.output} label="Copy" />
        </div>
        {result.ok ? (
          <pre className="min-h-[60px] max-h-96 overflow-y-auto scrollbar-thin whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
            {result.output || <span className="text-muted-foreground">Result appears here…</span>}
          </pre>
        ) : (
          <pre className="font-mono text-xs text-destructive">{result.error}</pre>
        )}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { CopyButton } from "@/components/site/copy-button";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Braces, Minimize2, AlertCircle, CheckCircle2, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";

type Indent = 2 | 4 | "tab";

export default function JsonFormatter() {
  const [text, setText] = React.useState("");
  const [indent, setIndent] = React.useState<Indent>(2);
  const [mode, setMode] = React.useState<"pretty" | "minify">("pretty");

  const result = React.useMemo(() => {
    if (!text.trim()) return { ok: true, output: "", error: "" };
    try {
      const parsed = JSON.parse(text);
      const indentStr = indent === "tab" ? "\t" : indent;
      const out =
        mode === "pretty"
          ? JSON.stringify(parsed, null, indentStr)
          : JSON.stringify(parsed);
      return { ok: true, output: out, error: "" };
    } catch (e) {
      return {
        ok: false,
        output: "",
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }, [text, indent, mode]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Paste JSON here, e.g. {"hello":"world"}'
          className="min-h-[140px] resize-y rounded-2xl font-mono text-sm"
          aria-label="JSON input"
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

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-border bg-card p-0.5">
          {(["pretty", "minify"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                mode === m ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "pretty" ? <Braces className="size-3.5" /> : <Minimize2 className="size-3.5" />}
              {m === "pretty" ? "Beautify" : "Minify"}
            </button>
          ))}
        </div>
        {mode === "pretty" && (
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            {([
              ["2", 2],
              ["4", 4],
              ["tab", "tab"],
            ] as const).map(([label, val]) => (
              <button
                key={label}
                onClick={() => setIndent(val)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  indent === val
                    ? "bg-brand text-brand-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label === "tab" ? "tab" : `${label} sp`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className={cn(
          "rounded-2xl border p-4",
          result.ok ? "border-border bg-card" : "border-destructive/30 bg-destructive/[0.04]"
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {result.ok ? (
              text.trim() ? (
                <>
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Valid JSON
                </>
              ) : (
                "Result"
              )
            ) : (
              <>
                <AlertCircle className="size-3.5 text-destructive" />
                Invalid JSON
              </>
            )}
          </p>
          <CopyButton value={result.output} label="Copy" />
        </div>
        {result.ok ? (
          <pre className="min-h-[80px] max-h-96 overflow-y-auto scrollbar-thin whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
            {result.output || <span className="text-muted-foreground">Result appears here…</span>}
          </pre>
        ) : (
          <pre className="font-mono text-xs text-destructive">{result.error}</pre>
        )}
      </div>
    </div>
  );
}

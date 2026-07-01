"use client";

import * as React from "react";
import { CopyButton } from "@/components/site/copy-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Unit = "paragraphs" | "sentences" | "words";

const WORDS = `
lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud
exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute
irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur
excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt
mollit anim id est laborum at vero eos accusamus iusto odio dignissimos ducimus
qui blanditiis praesentium voluptatum deleniti atque corrupti quos quas
molestias excepturi sint similique mollitia animi dolores eos ratione sequi
nesciunt neque porro quisquam dolorem adipisci numquam eius modi tempora
incidunt magnam quaerat voluptatem ut aut reiciendis voluptatibus maiores
`.trim().split(/\s+/);

function rand(max: number) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function makeSentence(min = 6, max = 14): string {
  const len = min + rand(max - min + 1);
  const words = Array.from({ length: len }, () => WORDS[rand(WORDS.length)]);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  // ~15% chance of comma in the middle
  if (len > 5 && rand(100) < 15) {
    const mid = Math.floor(len / 2);
    words[mid] = words[mid] + ",";
  }
  return words.join(" ") + ".";
}

function makeParagraph(min = 3, max = 6): string {
  const len = min + rand(max - min + 1);
  return Array.from({ length: len }, makeSentence).join(" ");
}

export default function LoremIpsum() {
  const [count, setCount] = React.useState(3);
  const [unit, setUnit] = React.useState<Unit>("paragraphs");
  const [startClassic, setStartClassic] = React.useState(true);
  const [output, setOutput] = React.useState("");

  const generate = React.useCallback(() => {
    let parts: string[] = [];
    if (unit === "paragraphs") {
      parts = Array.from({ length: count }, () => makeParagraph());
    } else if (unit === "sentences") {
      parts = Array.from({ length: count }, () => makeSentence());
    } else {
      parts = Array.from({ length: count }, () => WORDS[rand(WORDS.length)]);
    }
    if (startClassic && unit !== "words") {
      const first = parts[0];
      // Replace beginning with the classic "Lorem ipsum dolor sit amet…"
      const classic = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
      if (unit === "sentences") {
        parts[0] = classic + ".";
      } else {
        // Replace first sentence of the first paragraph
        const firstSentenceEnd = first.indexOf(".");
        if (firstSentenceEnd > 0) {
          parts[0] = classic + first.slice(firstSentenceEnd);
        } else {
          parts[0] = classic + ".";
        }
      }
    }
    setOutput(parts.join(unit === "words" ? " " : "\n\n"));
  }, [count, unit, startClassic]);

  React.useEffect(() => {
    generate();
  }, [generate]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg border border-border bg-background p-0.5">
            {(["paragraphs", "sentences", "words"] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                  unit === u ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {u}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={startClassic}
              onChange={(e) => setStartClassic(e.target.checked)}
              className="size-4 accent-brand"
            />
            <span>Start with &ldquo;Lorem ipsum…&rdquo;</span>
          </label>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Count</Label>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{count}</span>
          </div>
          <Slider
            min={1}
            max={unit === "words" ? 200 : 20}
            step={1}
            value={[count]}
            onValueChange={(v) => setCount(v[0])}
          />
        </div>
      </div>

      <Button onClick={generate} size="lg" className="w-full">
        <RefreshCw className="size-4" />
        Regenerate
      </Button>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Result · {output ? output.split(/\s+/).length : 0} words
          </p>
          <CopyButton value={output} label="Copy" />
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin whitespace-pre-wrap break-words text-sm leading-relaxed">
          {output || <span className="text-muted-foreground">Result appears here…</span>}
        </div>
      </div>
    </div>
  );
}

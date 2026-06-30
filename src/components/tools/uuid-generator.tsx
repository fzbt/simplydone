"use client";

import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import { CopyButton } from "@/components/site/copy-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RefreshCw, Copy } from "lucide-react";

export default function UuidGenerator() {
  const [count, setCount] = React.useState(5);
  const [uppercase, setUppercase] = React.useState(false);
  const [hyphens, setHyphens] = React.useState(true);
  const [uuids, setUuids] = React.useState<string[]>([]);

  const generate = React.useCallback(() => {
    const n = Math.max(1, Math.min(500, count));
    const out = Array.from({ length: n }, () => {
      let u = uuidv4();
      if (!hyphens) u = u.replace(/-/g, "");
      if (uppercase) u = u.toUpperCase();
      return u;
    });
    setUuids(out);
  }, [count, uppercase, hyphens]);

  React.useEffect(() => {
    generate();
  }, [generate]);

  const allText = uuids.join("\n");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="count" className="text-xs">
            Count
          </Label>
          <Input
            id="count"
            type="number"
            min={1}
            max={500}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>
        <label className="flex cursor-pointer items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="size-4 accent-brand"
          />
          <span>Uppercase</span>
        </label>
        <label className="flex cursor-pointer items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={hyphens}
            onChange={(e) => setHyphens(e.target.checked)}
            className="size-4 accent-brand"
          />
          <span>Include hyphens</span>
        </label>
      </div>

      <Button onClick={generate} className="w-full" size="lg">
        <RefreshCw className="size-4" />
        Generate {count} UUID{count > 1 ? "s" : ""}
      </Button>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {uuids.length} UUID{uuids.length !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            <CopyButton value={allText} label="Copy all" variant="outline" />
          </div>
        </div>
        <ul className="max-h-96 space-y-1 overflow-y-auto scrollbar-thin font-mono text-sm">
          {uuids.map((u, i) => (
            <li
              key={i}
              className="group flex items-center justify-between gap-2 rounded-lg px-2 py-1 hover:bg-muted"
            >
              <span className="select-all">{u}</span>
              <button
                onClick={() => navigator.clipboard.writeText(u)}
                aria-label={`Copy ${u}`}
                className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              >
                <Copy className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

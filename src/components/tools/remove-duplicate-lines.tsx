"use client";

import * as React from "react";
import { CopyButton } from "@/components/site/copy-button";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eraser } from "lucide-react";

type Sort = "none" | "asc" | "desc" | "len";

export default function RemoveDuplicateLines() {
  const [text, setText] = React.useState("");
  const [caseSensitive, setCaseSensitive] = React.useState(true);
  const [trimWhitespace, setTrimWhitespace] = React.useState(true);
  const [removeEmpty, setRemoveEmpty] = React.useState(true);
  const [sort, setSort] = React.useState<Sort>("none");

  const result = React.useMemo(() => {
    let lines = text.split("\n");
    if (trimWhitespace) lines = lines.map((l) => l.trim());
    if (removeEmpty) lines = lines.filter((l) => l.length > 0);

    const seen = new Set<string>();
    const out: string[] = [];
    for (const l of lines) {
      const key = caseSensitive ? l : l.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(l);
      }
    }

    switch (sort) {
      case "asc":
        out.sort((a, b) => a.localeCompare(b));
        break;
      case "desc":
        out.sort((a, b) => b.localeCompare(a));
        break;
      case "len":
        out.sort((a, b) => a.length - b.length);
        break;
    }

    return {
      text: out.join("\n"),
      originalLines: text ? text.split("\n").length : 0,
      uniqueLines: out.length,
      removed: text.split("\n").length - out.length,
    };
  }, [text, caseSensitive, trimWhitespace, removeEmpty, sort]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste lines here…"
          className="min-h-[160px] resize-y rounded-2xl font-mono text-sm"
          aria-label="Input lines"
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

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={caseSensitive}
            onCheckedChange={(c) => setCaseSensitive(Boolean(c))}
          />
          <span>Case-sensitive comparison</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={trimWhitespace}
            onCheckedChange={(c) => setTrimWhitespace(Boolean(c))}
          />
          <span>Trim each line</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={removeEmpty}
            onCheckedChange={(c) => setRemoveEmpty(Boolean(c))}
          />
          <span>Remove empty lines</span>
        </label>
        <div className="flex items-center gap-2 text-sm">
          <Label htmlFor="sort" className="shrink-0">
            Sort:
          </Label>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger id="sort" className="h-8 flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Keep order</SelectItem>
              <SelectItem value="asc">A → Z</SelectItem>
              <SelectItem value="desc">Z → A</SelectItem>
              <SelectItem value="len">By length</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Result · {result.uniqueLines} unique · {result.removed} removed
          </p>
          <CopyButton value={result.text} label="Copy" />
        </div>
        <pre className="min-h-[80px] max-h-96 overflow-y-auto scrollbar-thin whitespace-pre-wrap break-words font-mono text-xs">
          {result.text || <span className="text-muted-foreground">Result appears here…</span>}
        </pre>
      </div>
    </div>
  );
}

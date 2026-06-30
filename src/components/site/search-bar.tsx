"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchTools } from "@/lib/tools/registry";
import type { ToolMeta } from "@/lib/tools/types";
import { categoriesById } from "@/lib/tools/registry";

interface SearchBarProps {
  onPick: (tool: ToolMeta) => void;
  autoFocus?: boolean;
  size?: "lg" | "md";
  className?: string;
}

export function SearchBar({
  onPick,
  autoFocus,
  size = "lg",
  className,
}: SearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const results = React.useMemo(() => searchTools(query), [query]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  React.useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const pick = (tool: ToolMeta) => {
    onPick(tool);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length > 0) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      pick(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "relative flex items-center gap-2 rounded-2xl border bg-card shadow-sm transition-all",
          "focus-within:border-brand/60 focus-within:ring-4 focus-within:ring-brand-muted/40",
          open && "border-brand/60 ring-4 ring-brand-muted/40",
          size === "lg" ? "h-14 px-4" : "h-11 px-3.5"
        )}
      >
        <Search
          className={cn(
            "shrink-0 text-muted-foreground",
            size === "lg" ? "size-5" : "size-4"
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="What do you need? Search tools..."
          aria-label="Search tools"
          aria-autocomplete="list"
          aria-controls="search-results"
          className={cn(
            "min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none",
            size === "lg" ? "text-base" : "text-sm"
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
        <kbd className="hidden shrink-0 select-none rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </div>

      {open && query && (
        <div
          id="search-results"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl ring-1 ring-border/50"
        >
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No tools match &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto scrollbar-thin p-1.5">
              {results.map((tool, i) => {
                const category = categoriesById.get(tool.category);
                const Icon = tool.icon;
                return (
                  <li key={tool.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === activeIndex}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => pick(tool)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        i === activeIndex ? "bg-muted" : "hover:bg-muted/60"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg",
                          category?.bg
                        )}
                      >
                        <Icon className={cn("size-4", category?.accent)} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {tool.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {tool.description}
                        </span>
                      </span>
                      {category && (
                        <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {category.name}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

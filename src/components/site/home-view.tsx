"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolMeta } from "@/lib/tools/types";
import {
  tools,
  categories,
  toolsByCategory,
  categoriesById,
} from "@/lib/tools/registry";
import { SearchBar } from "@/components/site/search-bar";

interface HomeViewProps {
  onPick: (tool: ToolMeta) => void;
}

export function HomeView({ onPick }: HomeViewProps) {
  const popular = tools.filter((t) => t.popular);

  return (
    <div className="animate-fade-in">
      {/* ───────────── Hero ───────────── */}
      {/* overflow-visible so the search dropdown can escape; the decorative
          layers are clipped by an inner absolute wrapper instead.
          z-20 puts the hero (and its search dropdown) above the popular
          section below (z-10) so the dropdown isn't covered. */}
      <section className="relative z-20 overflow-visible border-b border-border">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bg-grid absolute inset-0 opacity-50" />
          <div
            className="absolute inset-x-0 -top-32 h-64 opacity-60"
            style={{
              background:
                "radial-gradient(closest-side, var(--brand-muted), transparent)",
            }}
          />
        </div>
        <div className="relative mx-auto w-full max-w-4xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pb-28 sm:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            23 tools · zero accounts · 100% local-first
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            One place for{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-emerald-300">
              life&apos;s little tasks
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Compress, convert, merge, generate. No tabs, no ads, no signups —
            just the tools you reach for every day, in one consistent place.
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <SearchBar onPick={onPick} autoFocus />
          </div>
        </div>
      </section>

      {/* ───────────── Popular ───────────── */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
              Popular tools
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Where most people start.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {popular.map((tool) => (
            <PopularCard key={tool.id} tool={tool} onPick={onPick} />
          ))}
        </div>
      </section>

      {/* ───────────── Categories ───────────── */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="mb-6">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            Browse by category
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Five families of tools, one consistent experience.
          </p>
        </div>
        <div className="space-y-4">
          {categories.map((cat) => {
            const catTools = toolsByCategory(cat.id);
            const CatIcon = cat.icon;
            return (
              <div
                key={cat.id}
                className="rounded-3xl border border-border bg-card p-4 sm:p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      cat.bg
                    )}
                  >
                    <CatIcon className={cn("size-5", cat.accent)} />
                  </span>
                  <div>
                    <h3 className="font-semibold tracking-tight">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {cat.description}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {catTools.map((tool) => {
                    const Icon = tool.icon;
                    const category = categoriesById.get(tool.category);
                    return (
                      <button
                        key={tool.id}
                        onClick={() => onPick(tool)}
                        className="group flex items-center gap-3 rounded-xl border border-transparent bg-muted/30 p-3 text-left transition-all hover:border-border hover:bg-muted"
                      >
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg",
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
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PopularCard({
  tool,
  onPick,
}: {
  tool: ToolMeta;
  onPick: (tool: ToolMeta) => void;
}) {
  const Icon = tool.icon;
  const category = categoriesById.get(tool.category);
  return (
    <button
      onClick={() => onPick(tool)}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          category?.bg
        )}
      >
        <Icon className={cn("size-5", category?.accent)} />
      </span>
      <div className="flex-1">
        <h3 className="font-medium tracking-tight">{tool.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {tool.description}
        </p>
      </div>
      <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
    </button>
  );
}

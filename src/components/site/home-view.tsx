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
        <div className="relative mx-auto w-full max-w-4xl px-4 pb-12 pt-12 text-center sm:px-6 sm:pb-28 sm:pt-28">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur sm:mb-6">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            23 tools · zero accounts · 100% local-first
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            One place for{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-emerald-300">
              life&apos;s little tasks
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-sm text-muted-foreground sm:mt-5 sm:text-lg">
            Compress, convert, merge, generate. No tabs, no ads, no signups —
            just the tools you reach for every day, in one consistent place.
          </p>

          <div className="mx-auto mt-6 max-w-2xl sm:mt-8">
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
                className="rounded-3xl border border-border bg-card p-3 sm:p-6"
              >
                <div className="mb-3 flex items-center gap-3 sm:mb-4">
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-xl sm:size-10",
                      cat.bg
                    )}
                  >
                    <CatIcon className={cn("size-4 sm:size-5", cat.accent)} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight sm:text-base">{cat.name}</h3>
                    <p className="hidden text-xs text-muted-foreground sm:block">
                      {cat.description}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2">
                  {catTools.map((tool) => {
                    const Icon = tool.icon;
                    const category = categoriesById.get(tool.category);
                    return (
                      <button
                        key={tool.id}
                        onClick={() => onPick(tool)}
                        className="group flex items-center gap-2.5 rounded-xl border border-transparent bg-muted/30 p-2.5 text-left transition-all hover:border-border hover:bg-muted sm:gap-3 sm:p-3"
                      >
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-lg sm:size-8",
                            category?.bg
                          )}
                        >
                          <Icon className={cn("size-3.5 sm:size-4", category?.accent)} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium sm:text-sm">
                            {tool.name}
                          </span>
                          <span className="hidden truncate text-xs text-muted-foreground sm:block">
                            {tool.description}
                          </span>
                        </span>
                        <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 sm:block" />
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
      className="group relative flex flex-col gap-2.5 overflow-hidden rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md sm:gap-3 sm:p-5"
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl sm:size-10",
          category?.bg
        )}
      >
        <Icon className={cn("size-4 sm:size-5", category?.accent)} />
      </span>
      <div className="flex-1">
        <h3 className="text-sm font-medium tracking-tight sm:text-base">{tool.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {tool.description}
        </p>
      </div>
      <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
    </button>
  );
}

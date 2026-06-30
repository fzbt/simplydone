"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Github, Search } from "lucide-react";
import { SearchBar } from "@/components/site/search-bar";
import { ThemeToggle } from "@/components/site/theme-toggle";
import type { ToolMeta } from "@/lib/tools/types";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onPick: (tool: ToolMeta) => void;
  onHome: () => void;
  compact?: boolean;
}

export function Header({ onPick, onHome, compact }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2.5 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:gap-3 sm:px-6 sm:py-0">
        {/* Logo row */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onHome}
            className="flex shrink-0 items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted"
            aria-label="SimplyDone home"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <CheckCircle2 className="size-5" />
            </span>
            <span className="hidden text-base font-semibold tracking-tight md:inline-block">
              SimplyDone
            </span>
          </button>

          {/* Mobile-only actions (theme toggle on the right of the logo row) */}
          <div className="flex items-center gap-1 sm:hidden">
            <ThemeToggle />
          </div>
        </div>

        {/* Search row — full width on mobile */}
        <div className="flex flex-1 items-center justify-center">
          {compact ? (
            <div className="w-full">
              <SearchBar onPick={onPick} size="md" />
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={onHome}
              className="ml-auto hidden w-full items-center gap-2 text-muted-foreground md:inline-flex"
            >
              <Search className="size-4" />
              <span>Search tools…</span>
            </Button>
          )}
        </div>

        {/* Desktop-only actions */}
        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full text-muted-foreground hover:text-foreground"
            aria-label="GitHub"
          >
            <Link href="https://github.com/fzbt/simplydone" aria-label="GitHub repository">
              <Github className="size-[18px]" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

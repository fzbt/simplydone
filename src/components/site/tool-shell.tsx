"use client";

import * as React from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ToolMeta } from "@/lib/tools/types";
import { categoriesById } from "@/lib/tools/registry";

interface ToolShellProps {
  tool: ToolMeta;
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared shell for every tool page. Renders breadcrumb + title + description
 * then the children body. Designed to enforce the "Open → Input → Process → Result"
 * pattern described in the PRD without dictating tool internals.
 */
export function ToolShell({ tool, children, className }: ToolShellProps) {
  const category = categoriesById.get(tool.category);
  const Icon = tool.icon;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-4 sm:px-6 sm:pt-10">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground sm:mb-6"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>All tools</span>
        </Link>
        {category && (
          <>
            <ChevronRight className="size-3.5 opacity-50" />
            <span className="rounded-md px-1.5 py-1">{category.name}</span>
          </>
        )}
      </nav>

      {/* Header */}
      <header className="mb-6 flex items-start gap-3 sm:mb-8 sm:gap-4">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-2xl sm:size-12",
            category?.bg
          )}
        >
          <Icon className={cn("size-5 sm:size-6", category?.accent)} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-3xl">
            {tool.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
        </div>
      </header>

      {/* Body */}
      <div className={cn("space-y-6", className)}>{children}</div>
    </div>
  );
}

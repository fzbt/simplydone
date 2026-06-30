"use client";

import * as React from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { tools, getTool } from "@/lib/tools/registry";
import type { ToolMeta } from "@/lib/tools/types";
import { ToolShell } from "@/components/site/tool-shell";
import { Button } from "@/components/ui/button";

// Pre-create a lazy component for every tool, at module scope (not during render).
const lazyComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = Object.fromEntries(
  tools.map((t) => [t.id, React.lazy(t.component)])
);

interface ToolViewProps {
  toolId: string;
  onHome: () => void;
}

export function ToolView({ toolId, onHome }: ToolViewProps) {
  const tool: ToolMeta | undefined = getTool(toolId);
  const LazyComponent = tool ? lazyComponents[tool.id] : null;

  if (!tool || !LazyComponent) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Tool not found</h1>
        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t find a tool called &ldquo;{toolId}&rdquo;.
        </p>
        <Button onClick={onHome} className="mt-6">
          <ArrowLeft className="size-4" />
          Back to home
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ToolShell tool={tool}>
        <React.Suspense
          fallback={
            <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span>Loading tool…</span>
              </div>
            </div>
          }
        >
          <LazyComponent />
        </React.Suspense>
      </ToolShell>
    </div>
  );
}

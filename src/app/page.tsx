"use client";

import * as React from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { HomeView } from "@/components/site/home-view";
import { ToolView } from "@/components/site/tool-view";
import { useToolRoute } from "@/lib/tools/use-tool-route";
import type { ToolMeta } from "@/lib/tools/types";
import { toast } from "sonner";

function HomePageContent() {
  const { activeTool, setTool } = useToolRoute();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setTool(null);
        setTimeout(() => {
          const input = document.querySelector<HTMLInputElement>(
            'input[aria-label="Search tools"]'
          );
          input?.focus();
        }, 50);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setTool]);

  const onPick = React.useCallback(
    (tool: ToolMeta) => {
      setTool(tool.id);
      toast.success(`Opening ${tool.name}`, { duration: 1500 });
    },
    [setTool]
  );

  const onHome = React.useCallback(() => setTool(null), [setTool]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onPick={onPick} onHome={onHome} compact={Boolean(activeTool)} />
      <main className="flex-1">
        {activeTool ? (
          <ToolView toolId={activeTool} onHome={onHome} />
        ) : (
          <HomeView onPick={onPick} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading…</div>
        </div>
      }
    >
      <HomePageContent />
    </React.Suspense>
  );
}
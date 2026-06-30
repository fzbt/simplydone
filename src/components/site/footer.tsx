"use client";

import * as React from "react";
import { CheckCircle2, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 text-brand" />
          <span>SimplyDone · One place for life&apos;s little tasks.</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Built with care · runs in your browser</span>
          <Heart className="size-3 text-rose-500" />
        </div>
      </div>
    </footer>
  );
}

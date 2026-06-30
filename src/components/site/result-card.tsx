"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  status?: "success" | "error" | "neutral";
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function ResultCard({
  status = "neutral",
  title,
  children,
  className,
  actions,
}: ResultCardProps) {
  const tone =
    status === "success"
      ? "border-emerald-500/30 bg-emerald-500/[0.04]"
      : status === "error"
        ? "border-destructive/30 bg-destructive/[0.04]"
        : "border-border bg-muted/30";

  const Icon =
    status === "success" ? CheckCircle2 : status === "error" ? AlertCircle : null;
  const iconColor =
    status === "success"
      ? "text-emerald-500"
      : status === "error"
        ? "text-destructive"
        : "";

  return (
    <div className={cn("animate-scale-in rounded-2xl border p-5", tone, className)}>
      {(title || Icon) && (
        <div className="mb-3 flex items-center gap-2">
          {Icon && <Icon className={cn("size-5", iconColor)} />}
          {title && (
            <h4 className="font-semibold leading-tight tracking-tight">{title}</h4>
          )}
        </div>
      )}
      <div className="text-sm">{children}</div>
      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

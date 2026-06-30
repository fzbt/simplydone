"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface CopyButtonProps {
  value: string | (() => string | Promise<string>);
  label?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function CopyButton({
  value,
  label = "Copy",
  className,
  size = "sm",
  variant = "outline",
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const onClick = async () => {
    try {
      const text =
        typeof value === "function" ? await value() : value;
      if (!text) {
        toast.error("Nothing to copy yet");
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn(className)}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {size !== "icon" && <span>{copied ? "Copied" : label}</span>}
    </Button>
  );
}

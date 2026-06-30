"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface DownloadButtonProps {
  /** Either a Blob, a data URL string, or a normal URL string */
  data: Blob | string | null | undefined;
  filename: string;
  label?: string;
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary";
  disabled?: boolean;
}

export function DownloadButton({
  data,
  filename,
  label = "Download",
  className,
  size = "default",
  variant = "default",
  disabled,
}: DownloadButtonProps) {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!data) {
      setUrl(null);
      return;
    }
    let created: string | null = null;
    if (typeof data === "string") {
      created = data;
      setUrl(data);
    } else {
      created = URL.createObjectURL(data);
      setUrl(created);
    }
    return () => {
      // Only revoke object URLs we created from blobs
      if (created && typeof data !== "string") {
        URL.revokeObjectURL(created);
      }
    };
  }, [data]);

  const onClick = () => {
    if (!url) {
      toast.error("Nothing to download yet");
      return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Download started");
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || !url}
      className={cn(className)}
    >
      <Download className="size-4" />
      <span>{label}</span>
    </Button>
  );
}

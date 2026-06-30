"use client";

import * as React from "react";
import { UploadCloud, X, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface UploadZoneProps {
  accept?: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
  files: File[];
  onFiles: (files: File[]) => void;
  onClear?: () => void;
  className?: string;
}

export function UploadZone({
  accept,
  multiple = false,
  label = "Drop file here, or click to browse",
  hint,
  files,
  onFiles,
  onClear,
  className,
}: UploadZoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const handleFiles = React.useCallback(
    (incoming: FileList | null) => {
      if (!incoming || incoming.length === 0) return;
      const arr = Array.from(incoming);
      onFiles(multiple ? arr : [arr[0]]);
    },
    [onFiles, multiple]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload files"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
          dragging
            ? "border-brand bg-brand-muted/40"
            : "border-border hover:border-brand/60 hover:bg-muted/40"
        )}
      >
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-full transition-colors",
            dragging
              ? "bg-brand text-brand-foreground"
              : "bg-muted text-muted-foreground group-hover:bg-brand-muted group-hover:text-brand"
          )}
        >
          <UploadCloud className="size-6" />
        </div>
        <div>
          <p className="font-medium text-foreground">{label}</p>
          {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            // Reset so the same file can be re-selected later
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              <FileIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate font-medium">{f.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatBytes(f.size)}
              </span>
              {onClear && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Remove ${f.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = files.filter((_, idx) => idx !== i);
                    onFiles(next);
                    if (next.length === 0) onClear();
                  }}
                >
                  <X className="size-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(k))
  );
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

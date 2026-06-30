"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { UploadZone, formatBytes } from "@/components/site/upload-zone";
import { ResultCard } from "@/components/site/result-card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/site/copy-button";
import { toast } from "sonner";
import { loadImageFromFile } from "@/lib/tools/image-utils";
import exifr from "exifr";

export default function ImageMetadata() {
  const [file, setFile] = React.useState<File | null>(null);
  const [meta, setMeta] = React.useState<Record<string, unknown> | null>(null);
  const [dims, setDims] = React.useState<{ w: number; h: number } | null>(null);
  const [busy, setBusy] = React.useState(false);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setMeta(null);
    setDims(null);
    setBusy(true);
    try {
      const img = await loadImageFromFile(f);
      setDims({ w: img.naturalWidth, h: img.naturalHeight });
      let exif: Record<string, unknown> | null = null;
      try {
        exif = await exifr.parse(f, true);
      } catch {
        exif = null;
      }
      setMeta(exif ?? {});
    } catch {
      toast.error("Could not read image");
    } finally {
      setBusy(false);
    }
  };

  const entries = meta
    ? Object.entries(meta)
        .filter(([k]) => !["thumbnail", "ImageCount", "iso"].includes(k))
        .filter(([, v]) => v !== null && v !== undefined && v !== "")
    : [];

  const summary = {
    "File name": file?.name ?? "",
    "File size": file ? formatBytes(file.size) : "",
    "File type": file?.type ?? "",
    "Last modified": file ? new Date(file.lastModified).toLocaleString() : "",
    Dimensions: dims ? `${dims.w} × ${dims.h}px` : "",
    Megapixels: dims ? `${((dims.w * dims.h) / 1_000_000).toFixed(1)} MP` : "",
    "Aspect ratio": dims
      ? `${(dims.w / dims.h).toFixed(3)} : 1`
      : "",
  };

  const copyAll = () =>
    [
      "=== File info ===",
      ...Object.entries(summary).map(([k, v]) => `${k}: ${v}`),
      "",
      "=== EXIF ===",
      ...entries.map(([k, v]) => `${k}: ${String(v)}`),
    ].join("\n");

  return (
    <div className="space-y-6">
      <UploadZone
        accept="image/*"
        files={file ? [file] : []}
        onFiles={onFiles}
        onClear={() => {
          setFile(null);
          setMeta(null);
          setDims(null);
        }}
        label="Drop an image to inspect"
        hint="JPG, PNG, WebP, HEIC, TIFF — EXIF supported"
      />

      {file && busy && (
        <div className="rounded-2xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Reading metadata…
        </div>
      )}

      {file && !busy && dims && (
        <>
          <ResultCard
            title="File information"
            actions={
              <CopyButton value={copyAll} label="Copy all" variant="outline" />
            }
          >
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {Object.entries(summary).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2 border-b border-border/40 py-1.5 text-sm">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="truncate font-mono text-xs">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </ResultCard>

          {entries.length > 0 && (
            <ResultCard title="EXIF metadata" status="neutral">
              <dl className="grid max-h-96 grid-cols-1 gap-x-6 gap-y-2 overflow-y-auto scrollbar-thin sm:grid-cols-2">
                {entries.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-2 border-b border-border/40 py-1.5 text-sm">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="truncate font-mono text-xs">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </ResultCard>
          )}

          {entries.length === 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              <Info className="size-4" />
              <span>No EXIF data found in this image.</span>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => {
              setFile(null);
              setMeta(null);
              setDims(null);
            }}
            className="w-full"
          >
            Inspect another
          </Button>
        </>
      )}
    </div>
  );
}

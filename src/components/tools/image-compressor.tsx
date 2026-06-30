"use client";

import * as React from "react";
import { ImageIcon, Sparkles } from "lucide-react";
import { UploadZone, formatBytes } from "@/components/site/upload-zone";
import { ResultCard } from "@/components/site/result-card";
import { DownloadButton } from "@/components/site/download-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  loadImageFromFile,
  createCanvas,
  canvasToBlob,
  fileExtension,
  replaceExtension,
  type ImageFormat,
} from "@/lib/tools/image-utils";

interface Result {
  blob: Blob;
  width: number;
  height: number;
  quality: number;
  format: ImageFormat;
  filename: string;
}

const FORMAT_EXT: Record<ImageFormat, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export default function ImageCompressor() {
  const [file, setFile] = React.useState<File | null>(null);
  const [quality, setQuality] = React.useState(70);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<Result | null>(null);
  const [originalSize, setOriginalSize] = React.useState(0);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setOriginalSize(f.size);
    setResult(null);
  };

  const compress = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const img = await loadImageFromFile(file);
      const canvas = createCanvas({ width: img.naturalWidth, height: img.naturalHeight });
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const ext = fileExtension(file.name);
      // PNG can't be quality-compressed; fall back to webp for compression
      const format: ImageFormat = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";
      const q = format === "image/png" ? undefined : quality / 100;

      const blob = await canvasToBlob(canvas, format, q);
      const outExt = FORMAT_EXT[format];
      setResult({
        blob,
        width: img.naturalWidth,
        height: img.naturalHeight,
        quality,
        format,
        filename: replaceExtension(file.name, outExt),
      });
      toast.success("Compression complete");
    } catch (e) {
      toast.error("Could not compress image");
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const savings =
    result && originalSize > 0
      ? Math.max(0, Math.round((1 - result.blob.size / originalSize) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {!result && (
        <UploadZone
          accept="image/png,image/jpeg,image/webp"
          files={file ? [file] : []}
          onFiles={onFiles}
          onClear={() => {
            setFile(null);
            setOriginalSize(0);
          }}
          label="Drop an image, or click to browse"
          hint="PNG, JPG or WebP — up to ~25MB"
        />
      )}

      {file && !result && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <ImageIcon className="size-5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </p>
            </div>
          </div>

          {fileExtension(file.name) !== "png" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="quality" className="text-sm">
                  Quality
                </Label>
                <span className="font-mono text-sm tabular-nums text-muted-foreground">
                  {quality}%
                </span>
              </div>
              <Slider
                id="quality"
                min={10}
                max={100}
                step={5}
                value={[quality]}
                onValueChange={(v) => setQuality(v[0])}
              />
              <p className="text-xs text-muted-foreground">
                Lower quality = smaller file. 70% is a good default for photos.
              </p>
            </div>
          )}

          {fileExtension(file.name) === "png" && (
            <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              PNG is lossless — quality can&apos;t be lowered. We&apos;ll re-encode at
              the same quality, which usually still shrinks the file by stripping
              metadata.
            </p>
          )}

          <Button
            onClick={compress}
            disabled={busy}
            className="mt-5 w-full"
            size="lg"
          >
            <Sparkles className="size-4" />
            {busy ? "Compressing…" : "Compress image"}
          </Button>
        </div>
      )}

      {result && (
        <ResultCard
          status="success"
          title="Image compressed"
          actions={
            <>
              <DownloadButton
                data={result.blob}
                filename={result.filename}
                label={`Download ${result.filename}`}
              />
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setFile(null);
                }}
              >
                Compress another
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Original" value={formatBytes(originalSize)} />
            <Stat label="Compressed" value={formatBytes(result.blob.size)} />
            <Stat
              label="Saved"
              value={savings > 0 ? `${savings}%` : "—"}
              tone={savings > 0 ? "positive" : "neutral"}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {result.width} × {result.height}px · {result.format.split("/")[1].toUpperCase()}
            {result.format !== "image/png" && ` · ${result.quality}% quality`}
          </p>
        </ResultCard>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive";
}) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-sm font-semibold tabular-nums ${
          tone === "positive" ? "text-emerald-500" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

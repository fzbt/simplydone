"use client";

import * as React from "react";
import { CropIcon, Sparkles } from "lucide-react";
import { UploadZone, formatBytes } from "@/components/site/upload-zone";
import { ResultCard } from "@/components/site/result-card";
import { DownloadButton } from "@/components/site/download-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  filename: string;
}

export default function ImageResizer() {
  const [file, setFile] = React.useState<File | null>(null);
  const [originalW, setOriginalW] = React.useState(0);
  const [originalH, setOriginalH] = React.useState(0);
  const [targetW, setTargetW] = React.useState(0);
  const [targetH, setTargetH] = React.useState(0);
  const [keepAspect, setKeepAspect] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<Result | null>(null);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    try {
      const img = await loadImageFromFile(f);
      setOriginalW(img.naturalWidth);
      setOriginalH(img.naturalHeight);
      setTargetW(img.naturalWidth);
      setTargetH(img.naturalHeight);
    } catch {
      toast.error("Could not read image");
    }
  };

  const aspect = originalW && originalH ? originalW / originalH : 1;

  const onWChange = (v: number) => {
    setTargetW(v);
    if (keepAspect && v > 0) setTargetH(Math.round(v / aspect));
  };
  const onHChange = (v: number) => {
    setTargetH(v);
    if (keepAspect && v > 0) setTargetW(Math.round(v * aspect));
  };

  const resize = async () => {
    if (!file || !targetW || !targetH) return;
    setBusy(true);
    try {
      const img = await loadImageFromFile(file);
      const canvas = createCanvas({ width: targetW, height: targetH });
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetW, targetH);
      const ext = fileExtension(file.name);
      const format: ImageFormat =
        ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
      const blob = await canvasToBlob(canvas, format, format === "image/png" ? undefined : 0.92);
      const outExt = ext === "png" ? "png" : ext === "webp" ? "webp" : "jpg";
      setResult({ blob, width: targetW, height: targetH, filename: replaceExtension(file.name, `${outExt}_${targetW}x${targetH}`) });
      toast.success("Resize complete");
    } catch {
      toast.error("Could not resize image");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {!result && (
        <UploadZone
          accept="image/png,image/jpeg,image/webp"
          files={file ? [file] : []}
          onFiles={onFiles}
          onClear={() => {
            setFile(null);
            setOriginalW(0);
            setOriginalH(0);
          }}
          label="Drop an image, or click to browse"
          hint="PNG, JPG or WebP"
        />
      )}

      {file && !result && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="mb-4 text-sm text-muted-foreground">
            Original:{" "}
            <span className="font-mono font-medium text-foreground">
              {originalW} × {originalH}px
            </span>{" "}
            · {formatBytes(file.size)}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                min={1}
                value={targetW || ""}
                onChange={(e) => onWChange(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                min={1}
                value={targetH || ""}
                onChange={(e) => onHChange(Number(e.target.value))}
              />
            </div>
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={keepAspect}
              onCheckedChange={(c) => setKeepAspect(Boolean(c))}
            />
            <span>Lock aspect ratio</span>
          </label>
          <Button
            onClick={resize}
            disabled={busy || !targetW || !targetH}
            className="mt-5 w-full"
            size="lg"
          >
            <Sparkles className="size-4" />
            {busy ? "Resizing…" : "Resize image"}
          </Button>
        </div>
      )}

      {result && (
        <ResultCard
          status="success"
          title="Image resized"
          actions={
            <>
              <DownloadButton data={result.blob} filename={result.filename} />
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setFile(null);
                }}
              >
                Resize another
              </Button>
            </>
          }
        >
          <p>
            New dimensions:{" "}
            <span className="font-mono font-medium">
              {result.width} × {result.height}px
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            File size: {formatBytes(result.blob.size)}
          </p>
        </ResultCard>
      )}
    </div>
  );
}

// Avoid unused import warning
void CropIcon;

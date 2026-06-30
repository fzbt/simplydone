"use client";

import * as React from "react";
import { Sparkles, FileType2 } from "lucide-react";
import { UploadZone, formatBytes } from "@/components/site/upload-zone";
import { ResultCard } from "@/components/site/result-card";
import { DownloadButton } from "@/components/site/download-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  loadImageFromFile,
  createCanvas,
  canvasToBlob,
  fileExtension,
  replaceExtension,
  type ImageFormat,
} from "@/lib/tools/image-utils";

type Target = "png" | "jpg" | "webp";

const TARGETS: { value: Target; label: string; mime: ImageFormat; ext: string }[] = [
  { value: "png", label: "PNG (lossless)", mime: "image/png", ext: "png" },
  { value: "jpg", label: "JPG (compressed)", mime: "image/jpeg", ext: "jpg" },
  { value: "webp", label: "WebP (modern)", mime: "image/webp", ext: "webp" },
];

export default function ImageConverter() {
  const [file, setFile] = React.useState<File | null>(null);
  const [target, setTarget] = React.useState<Target>("webp");
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<{ blob: Blob; filename: string } | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    // Auto-pick a target different from source
    const ext = fileExtension(f.name);
    if (ext === "png") setTarget("webp");
    else if (ext === "webp") setTarget("png");
    else if (ext === "jpg" || ext === "jpeg") setTarget("webp");
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const img = await loadImageFromFile(file);
      const canvas = createCanvas({ width: img.naturalWidth, height: img.naturalHeight });
      const ctx = canvas.getContext("2d")!;
      // JPG has no alpha — fill white background first
      if (target === "jpg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const t = TARGETS.find((x) => x.value === target)!;
      const blob = await canvasToBlob(canvas, t.mime, target === "png" ? undefined : 0.92);
      setResult({ blob, filename: replaceExtension(file.name, t.ext) });
      toast.success(`Converted to ${target.toUpperCase()}`);
    } catch {
      toast.error("Could not convert image");
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
          onClear={() => setFile(null)}
          label="Drop an image, or click to browse"
          hint="PNG, JPG or WebP"
        />
      )}

      {file && !result && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <FileType2 className="size-5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)} · {fileExtension(file.name).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="target">Convert to</Label>
            <Select value={target} onValueChange={(v) => setTarget(v as Target)}>
              <SelectTrigger id="target" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TARGETS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={convert} disabled={busy} className="mt-5 w-full" size="lg">
            <Sparkles className="size-4" />
            {busy ? "Converting…" : `Convert to ${target.toUpperCase()}`}
          </Button>
        </div>
      )}

      {result && (
        <ResultCard
          status="success"
          title="Image converted"
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
                Convert another
              </Button>
            </>
          }
        >
          <p className="text-xs text-muted-foreground">
            File size: {formatBytes(result.blob.size)}
          </p>
        </ResultCard>
      )}
    </div>
  );
}

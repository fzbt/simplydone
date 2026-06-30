"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { UploadZone, formatBytes } from "@/components/site/upload-zone";
import { ResultCard } from "@/components/site/result-card";
import { DownloadButton } from "@/components/site/download-button";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  loadImageFromFile,
  createCanvas,
  canvasToBlob,
  fileExtension,
  replaceExtension,
  type ImageFormat,
} from "@/lib/tools/image-utils";

interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function ImageCropper() {
  const [file, setFile] = React.useState<File | null>(null);
  const [imgUrl, setImgUrl] = React.useState<string>("");
  const [naturalW, setNaturalW] = React.useState(0);
  const [naturalH, setNaturalH] = React.useState(0);
  const [crop, setCrop] = React.useState<Crop>({ x: 0, y: 0, w: 0, h: 0 });
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<{ blob: Blob; filename: string } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<{ startX: number; startY: number } | null>(null);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    const img = await loadImageFromFile(f);
    setNaturalW(img.naturalWidth);
    setNaturalH(img.naturalHeight);
    setCrop({ x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight });
  };

  // Convert container-space mouse coords to natural-image coords
  const toImageCoords = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const scaleX = naturalW / rect.width;
    const scaleY = naturalH / rect.height;
    return {
      x: Math.max(0, Math.min(naturalW, (clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(naturalH, (clientY - rect.top) * scaleY)),
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const start = toImageCoords(e.clientX, e.clientY);
    dragRef.current = { startX: start.x, startY: start.y };
    setCrop({ x: start.x, y: start.y, w: 0, h: 0 });
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const cur = toImageCoords(e.clientX, e.clientY);
    const sx = dragRef.current.startX;
    const sy = dragRef.current.startY;
    setCrop({
      x: Math.min(sx, cur.x),
      y: Math.min(sy, cur.y),
      w: Math.abs(cur.x - sx),
      h: Math.abs(cur.y - sy),
    });
  };
  const onMouseUp = () => {
    dragRef.current = null;
  };

  const doCrop = async () => {
    if (!file || !crop.w || !crop.h) {
      toast.error("Drag on the image to select a crop area");
      return;
    }
    setBusy(true);
    try {
      const img = await loadImageFromFile(file);
      const cw = Math.round(crop.w);
      const ch = Math.round(crop.h);
      const cx = Math.round(crop.x);
      const cy = Math.round(crop.y);
      const canvas = createCanvas({ width: cw, height: ch });
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch);
      const ext = fileExtension(file.name);
      const format: ImageFormat =
        ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
      const blob = await canvasToBlob(canvas, format, format === "image/png" ? undefined : 0.92);
      const outExt = ext === "png" ? "png" : ext === "webp" ? "webp" : "jpg";
      setResult({ blob, filename: replaceExtension(file.name, `${outExt}_cropped`) });
      toast.success("Crop complete");
    } catch {
      toast.error("Could not crop image");
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
            setImgUrl("");
          }}
          label="Drop an image, or click to browse"
          hint="PNG, JPG or WebP"
        />
      )}

      {file && !result && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div
            ref={containerRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            className="relative select-none overflow-hidden rounded-xl bg-[repeating-conic-gradient(var(--muted)_0_25%,transparent_0_50%)] bg-[length:24px_24px]"
            style={{ cursor: "crosshair" }}
          >
            <img
              src={imgUrl}
              alt="Source"
              className="pointer-events-none block w-full"
              draggable={false}
            />
            {crop.w > 0 && crop.h > 0 && (
              <div
                className="pointer-events-none absolute border-2 border-brand shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"
                style={{
                  left: `${(crop.x / naturalW) * 100}%`,
                  top: `${(crop.y / naturalH) * 100}%`,
                  width: `${(crop.w / naturalW) * 100}%`,
                  height: `${(crop.h / naturalH) * 100}%`,
                }}
              />
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Drag on the image to select a crop area.
            {crop.w > 0 && (
              <span className="ml-2 font-mono">
                {Math.round(crop.w)} × {Math.round(crop.h)}px
              </span>
            )}
          </p>
          <Button
            onClick={doCrop}
            disabled={busy || !crop.w || !crop.h}
            className="mt-5 w-full"
            size="lg"
          >
            <Sparkles className="size-4" />
            {busy ? "Cropping…" : "Crop image"}
          </Button>
        </div>
      )}

      {result && (
        <ResultCard
          status="success"
          title="Image cropped"
          actions={
            <>
              <DownloadButton data={result.blob} filename={result.filename} />
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  setImgUrl("");
                }}
              >
                Crop another
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

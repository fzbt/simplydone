"use client";

import * as React from "react";
import { Sparkles, Pipette } from "lucide-react";
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
  replaceExtension,
} from "@/lib/tools/image-utils";

export default function RemoveBackground() {
  const [file, setFile] = React.useState<File | null>(null);
  const [imgUrl, setImgUrl] = React.useState<string>("");
  const [naturalW, setNaturalW] = React.useState(0);
  const [naturalH, setNaturalH] = React.useState(0);
  const [bgColor, setBgColor] = React.useState<[number, number, number] | null>(null);
  const [tolerance, setTolerance] = React.useState(32);
  const [feather, setFeather] = React.useState(8);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<{ blob: Blob; filename: string } | null>(null);
  const previewRef = React.useRef<HTMLCanvasElement>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    const img = await loadImageFromFile(f);
    imageRef.current = img;
    setNaturalW(img.naturalWidth);
    setNaturalH(img.naturalHeight);
    // Auto-detect background color from the top-left pixel
    const c = createCanvas({ width: 1, height: 1 });
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    setBgColor([r, g, b]);
    drawPreview();
  };

  const drawPreview = React.useCallback(() => {
    const img = imageRef.current;
    const canvas = previewRef.current;
    if (!img || !canvas || !bgColor) return;
    const w = Math.min(800, img.naturalWidth);
    const h = Math.round((img.naturalHeight * w) / img.naturalWidth);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h);
    const px = data.data;
    const [br, bg, bb] = bgColor;
    const tol2 = tolerance * tolerance * 3;
    const feather2 = (tolerance + feather) * (tolerance + feather) * 3;
    for (let i = 0; i < px.length; i += 4) {
      const dr = px[i] - br;
      const dg = px[i + 1] - bg;
      const db = px[i + 2] - bb;
      const d2 = dr * dr + dg * dg + db * db;
      if (d2 <= tol2) {
        px[i + 3] = 0;
      } else if (d2 <= feather2) {
        const t = (d2 - tol2) / (feather2 - tol2);
        px[i + 3] = Math.round(255 * t);
      }
    }
    ctx.putImageData(data, 0, 0);
  }, [bgColor, tolerance, feather]);

  React.useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  const pickColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    const ctx = canvas.getContext("2d")!;
    // Re-draw original to read color from a fresh source
    const img = imageRef.current!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(x, y, 1, 1).data;
    setBgColor([data[0], data[1], data[2]]);
  };

  const process = async () => {
    if (!file || !bgColor || !imageRef.current) return;
    setBusy(true);
    try {
      const img = imageRef.current;
      const canvas = createCanvas({ width: img.naturalWidth, height: img.naturalHeight });
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const px = data.data;
      const [br, bg, bb] = bgColor;
      const tol2 = tolerance * tolerance * 3;
      const feather2 = (tolerance + feather) * (tolerance + feather) * 3;
      for (let i = 0; i < px.length; i += 4) {
        const dr = px[i] - br;
        const dg = px[i + 1] - bg;
        const db = px[i + 2] - bb;
        const d2 = dr * dr + dg * dg + db * db;
        if (d2 <= tol2) {
          px[i + 3] = 0;
        } else if (d2 <= feather2) {
          const t = (d2 - tol2) / (feather2 - tol2);
          px[i + 3] = Math.round(255 * t);
        }
      }
      ctx.putImageData(data, 0, 0);
      const blob = await canvasToBlob(canvas, "image/png");
      setResult({ blob, filename: replaceExtension(file.name, "png") });
      toast.success("Background removed");
    } catch {
      toast.error("Could not process image");
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
            setBgColor(null);
          }}
          label="Drop an image, or click to browse"
          hint="Best results with a solid-color background"
        />
      )}

      {file && !result && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                Click on the background color in the preview to pick it. We&apos;ll
                make similar pixels transparent.
              </p>
              <div className="relative overflow-hidden rounded-xl bg-[repeating-conic-gradient(var(--muted)_0_25%,transparent_0_50%)] bg-[length:24px_24px]">
                <canvas
                  ref={previewRef}
                  onClick={pickColor}
                  className="block w-full cursor-crosshair"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Pipette className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Picked color:</span>
              <span
                className="size-6 rounded-md border border-border"
                style={
                  bgColor
                    ? { backgroundColor: `rgb(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]})` }
                    : {}
                }
              />
              {bgColor && (
                <span className="font-mono text-xs text-muted-foreground">
                  rgb({bgColor.join(", ")})
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Tolerance</Label>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {tolerance}
                  </span>
                </div>
                <Slider
                  min={5}
                  max={120}
                  step={1}
                  value={[tolerance]}
                  onValueChange={(v) => setTolerance(v[0])}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Feather</Label>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {feather}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={40}
                  step={1}
                  value={[feather]}
                  onValueChange={(v) => setFeather(v[0])}
                />
              </div>
            </div>

            <Button onClick={process} disabled={busy || !bgColor} className="w-full" size="lg">
              <Sparkles className="size-4" />
              {busy ? "Processing…" : "Remove background"}
            </Button>
          </div>
        </div>
      )}

      {result && (
        <ResultCard
          status="success"
          title="Background removed"
          actions={
            <>
              <DownloadButton data={result.blob} filename={result.filename} />
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  setImgUrl("");
                  setBgColor(null);
                }}
              >
                Process another
              </Button>
            </>
          }
        >
          <div className="overflow-hidden rounded-lg bg-[repeating-conic-gradient(var(--muted)_0_25%,transparent_0_50%)] bg-[length:16px_16px]">
            <img
              src={URL.createObjectURL(result.blob)}
              alt="Result"
              className="block max-h-64 w-full object-contain"
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            File size: {formatBytes(result.blob.size)} · PNG with transparency
          </p>
        </ResultCard>
      )}

      {/* Hidden src image kept for preview rendering when needed */}
      {imgUrl && (
        <img src={imgUrl} alt="" className="hidden" aria-hidden />
      )}
    </div>
  );
}

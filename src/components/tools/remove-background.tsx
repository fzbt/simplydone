"use client";

import * as React from "react";
import { Sparkles, Wand2, Pipette, Cpu, Zap, AlertTriangle } from "lucide-react";
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

type Mode = "ai" | "simple";

interface Progress {
  stage: "idle" | "downloading" | "processing" | "done";
  message: string;
  percent?: number;
}

export default function RemoveBackground() {
  const [mode, setMode] = React.useState<Mode>("ai");
  const [file, setFile] = React.useState<File | null>(null);
  const [imgUrl, setImgUrl] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState<Progress>({ stage: "idle", message: "" });
  const [result, setResult] = React.useState<{ blob: Blob; filename: string } | null>(null);

  // Simple-mode state
  const [bgColor, setBgColor] = React.useState<[number, number, number] | null>(null);
  const [tolerance, setTolerance] = React.useState(32);
  const [feather, setFeather] = React.useState(8);
  const previewRef = React.useRef<HTMLCanvasElement>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setProgress({ stage: "idle", message: "" });
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    const img = await loadImageFromFile(f);
    imageRef.current = img;
    // Auto-detect background color from the top-left pixel (used by simple mode)
    const c = createCanvas({ width: 1, height: 1 });
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    setBgColor([r, g, b]);
    drawSimplePreview();
  };

  // Simple-mode preview rendering
  const drawSimplePreview = React.useCallback(() => {
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
    if (mode === "simple") drawSimplePreview();
  }, [mode, drawSimplePreview]);

  // Simple-mode color picker
  const pickColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    const ctx = canvas.getContext("2d")!;
    const img = imageRef.current!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(x, y, 1, 1).data;
    setBgColor([data[0], data[1], data[2]]);
  };

  // Simple-mode processing (full resolution)
  const runSimple = async () => {
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

  // AI-mode processing using @imgly/background-removal
  const runAI = async () => {
    if (!file) return;
    setBusy(true);
    setProgress({ stage: "downloading", message: "Loading AI model… (first run downloads ~80MB, then cached)" });
    try {
      // Dynamic import so the heavy library only loads when this tool is used
      const { removeBackground } = await import("@imgly/background-removal");
      setProgress({ stage: "processing", message: "Removing background with AI…" });

      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          // The library reports download progress as "fetch:..." keys
          if (key.startsWith("fetch")) {
            const percent = total > 0 ? Math.round((current / total) * 100) : 0;
            setProgress({
              stage: "downloading",
              message: `Downloading AI model… ${percent}%`,
              percent,
            });
          } else {
            setProgress({
              stage: "processing",
              message: "Analyzing image and removing background…",
            });
          }
        },
        output: { format: "image/png" },
      });

      setResult({ blob, filename: replaceExtension(file.name, "png") });
      setProgress({ stage: "done", message: "" });
      toast.success("Background removed with AI");
    } catch (e) {
      console.error(e);
      setProgress({ stage: "idle", message: "" });
      toast.error(
        e instanceof Error && e.message.includes("WebAssembly")
          ? "Your browser doesn't support WebAssembly. Try the Simple mode instead."
          : "AI processing failed. Try Simple mode or a different image."
      );
    } finally {
      setBusy(false);
    }
  };

  const process = () => {
    if (mode === "ai") runAI();
    else runSimple();
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
            setProgress({ stage: "idle", message: "" });
          }}
          label="Drop an image, or click to browse"
          hint="PNG, JPG or WebP — AI mode works best with people or objects"
        />
      )}

      {/* Mode selector */}
      {!result && file && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Removal mode
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              onClick={() => setMode("ai")}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                mode === "ai"
                  ? "border-brand bg-brand-muted/30"
                  : "border-border hover:bg-muted"
              }`}
            >
              <Cpu className={`size-5 shrink-0 ${mode === "ai" ? "text-brand" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">AI Removal</p>
                <p className="text-xs text-muted-foreground">
                  Neural network — works on any background. ~5-15s.
                </p>
              </div>
            </button>
            <button
              onClick={() => setMode("simple")}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                mode === "simple"
                  ? "border-brand bg-brand-muted/30"
                  : "border-border hover:bg-muted"
              }`}
            >
              <Zap className={`size-5 shrink-0 ${mode === "simple" ? "text-brand" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">Simple (color key)</p>
                <p className="text-xs text-muted-foreground">
                  Fast — best for solid-color backgrounds. &lt;1s.
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* AI mode info / progress */}
      {file && !result && mode === "ai" && (
        <div className="rounded-2xl border border-border bg-card p-5">
          {progress.stage === "idle" ? (
            <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3 text-sm">
              <AlertTriangle className="size-4 shrink-0 text-amber-500" />
              <div className="flex-1">
                <p className="font-medium">First-run heads up</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  The AI model (~80MB) downloads on first use and is cached afterwards.
                  Subsequent runs are much faster. Processing happens entirely in your
                  browser — your image never gets uploaded anywhere.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="relative flex size-12 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-brand/20" />
                <div className="relative flex size-12 items-center justify-center rounded-full bg-brand text-brand-foreground">
                  <Sparkles className="size-5" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">{progress.message}</p>
                {progress.percent !== undefined && (
                  <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-brand transition-all"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <Button
            onClick={process}
            disabled={busy || progress.stage === "downloading"}
            className="mt-5 w-full"
            size="lg"
          >
            <Wand2 className="size-4" />
            {busy
              ? "Working…"
              : progress.stage === "downloading"
                ? "Downloading model…"
                : "Remove background with AI"}
          </Button>
        </div>
      )}

      {/* Simple mode controls */}
      {file && !result && mode === "simple" && (
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

      {/* Result */}
      {result && (
        <ResultCard
          status="success"
          title={`Background removed ${mode === "ai" ? "with AI" : "(simple mode)"}`}
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
                  setProgress({ stage: "idle", message: "" });
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

      {imgUrl && <img src={imgUrl} alt="" className="hidden" aria-hidden />}
    </div>
  );
}

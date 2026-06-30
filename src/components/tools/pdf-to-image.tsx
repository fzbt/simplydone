"use client";

import * as React from "react";
import { Sparkles, FileImage } from "lucide-react";
import { UploadZone, formatBytes } from "@/components/site/upload-zone";
import { ResultCard } from "@/components/site/result-card";
import { DownloadButton } from "@/components/site/download-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

// pdfjs-dist worker — we use the bundled worker via static import
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Use the CDN worker that matches the installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PageImage {
  pageNum: number;
  blob: Blob;
  dataUrl: string;
}

export default function PdfToImage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [pageCount, setPageCount] = React.useState(0);
  const [scale, setScale] = React.useState(2);
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [pages, setPages] = React.useState<PageImage[]>([]);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setPages([]);
    try {
      const buf = await f.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      setPageCount(doc.numPages);
      doc.destroy();
    } catch {
      toast.error("Could not read PDF");
    }
  };

  const render = async () => {
    if (!file) return;
    setBusy(true);
    setProgress(0);
    try {
      const buf = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      const out: PageImage[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/png")
        );
        out.push({ pageNum: i, blob, dataUrl: URL.createObjectURL(blob) });
        setProgress(Math.round((i / doc.numPages) * 100));
        setPages([...out]);
      }
      await doc.destroy();
      toast.success(`Rendered ${out.length} pages`);
    } catch (e) {
      console.error(e);
      toast.error("Could not render PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {pages.length === 0 && (
        <UploadZone
          accept="application/pdf"
          files={file ? [file] : []}
          onFiles={onFiles}
          onClear={() => {
            setFile(null);
            setPageCount(0);
          }}
          label="Drop a PDF, or click to browse"
          hint="Each page becomes a PNG"
        />
      )}

      {file && pages.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <FileImage className="size-5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {pageCount} pages · {formatBytes(file.size)}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Resolution</Label>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {scale}× ({scale < 2 ? "fast" : scale === 2 ? "balanced" : "high"})
              </span>
            </div>
            <Slider
              min={1}
              max={4}
              step={0.5}
              value={[scale]}
              onValueChange={(v) => setScale(v[0])}
            />
            <p className="text-xs text-muted-foreground">
              Higher scale = sharper image but larger file. 2× is a good default.
            </p>
          </div>
          <Button onClick={render} disabled={busy || !pageCount} className="mt-5 w-full" size="lg">
            <Sparkles className="size-4" />
            {busy ? `Rendering… ${progress}%` : "Render to images"}
          </Button>
          {busy && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-brand transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {pages.length > 0 && (
        <ResultCard
          status="success"
          title={`Rendered ${pages.length} pages`}
          actions={
            <Button
              variant="outline"
              onClick={() => {
                setPages([]);
                setFile(null);
              }}
            >
              Render another
            </Button>
          }
        >
          <div className="grid max-h-[480px] grid-cols-2 gap-3 overflow-y-auto scrollbar-thin sm:grid-cols-3">
            {pages.map((p) => (
              <div
                key={p.pageNum}
                className="overflow-hidden rounded-xl border border-border bg-background"
              >
                <div className="aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={p.dataUrl}
                    alt={`Page ${p.pageNum}`}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                  <span className="text-xs font-medium">Page {p.pageNum}</span>
                  <DownloadButton
                    data={p.blob}
                    filename={`page-${p.pageNum}.png`}
                    label=""
                    size="icon"
                    variant="ghost"
                  />
                </div>
              </div>
            ))}
          </div>
        </ResultCard>
      )}
    </div>
  );
}

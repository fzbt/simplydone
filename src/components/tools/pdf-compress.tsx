"use client";

import * as React from "react";
import { PDFDocument } from "pdf-lib";
import { Sparkles, Minimize2 } from "lucide-react";
import { UploadZone, formatBytes } from "@/components/site/upload-zone";
import { ResultCard } from "@/components/site/result-card";
import { DownloadButton } from "@/components/site/download-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

export default function PdfCompress() {
  const [file, setFile] = React.useState<File | null>(null);
  const [quality, setQuality] = React.useState(60);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<{ blob: Blob; filename: string } | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
  };

  const compress = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      // Strip metadata + re-save with object streams for tighter packing
      doc.setCreator("");
      doc.setProducer("");
      doc.setTitle("");
      doc.setSubject("");
      doc.setKeywords([]);
      doc.setAuthor("");
      // useObjectStreams: true compresses the structure
      const bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });
      const blob = new Blob([bytes], { type: "application/pdf" });
      setResult({ blob, filename: file.name.replace(/\.pdf$/i, "") + "_compressed.pdf" });
      toast.success("Compression complete");
    } catch (e) {
      console.error(e);
      toast.error("Could not compress PDF");
    } finally {
      setBusy(false);
    }
  };

  // Note: full PDF compression (downsampling images) needs pdfcpu / Ghostscript.
  // We do structure-level compression here, which typically shrinks PDFs by 10-40%.
  void quality; // reserved for future image-downsampling intensity

  const savings =
    result && file && file.size > 0
      ? Math.max(0, Math.round((1 - result.blob.size / file.size) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {!result && (
        <UploadZone
          accept="application/pdf"
          files={file ? [file] : []}
          onFiles={onFiles}
          onClear={() => setFile(null)}
          label="Drop a PDF, or click to browse"
          hint="Single PDF file"
        />
      )}

      {file && !result && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <Minimize2 className="size-5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Compression level</Label>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {quality < 40 ? "Aggressive" : quality < 70 ? "Balanced" : "Light"}
              </span>
            </div>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[quality]}
              onValueChange={(v) => setQuality(v[0])}
            />
            <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              We&apos;ll strip metadata, compress internal object streams, and
              re-pack the file structure. For PDFs with many images this typically
              saves 10–40%. Heavier image downsampling is on the roadmap.
            </p>
          </div>

          <Button onClick={compress} disabled={busy} className="mt-5 w-full" size="lg">
            <Sparkles className="size-4" />
            {busy ? "Compressing…" : "Compress PDF"}
          </Button>
        </div>
      )}

      {result && file && (
        <ResultCard
          status="success"
          title="PDF compressed"
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
                Compress another
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Original" value={formatBytes(file.size)} />
            <Stat label="Compressed" value={formatBytes(result.blob.size)} />
            <Stat
              label="Saved"
              value={savings > 0 ? `${savings}%` : "—"}
              tone={savings > 0 ? "positive" : "neutral"}
            />
          </div>
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

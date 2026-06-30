"use client";

import * as React from "react";
import { PDFDocument } from "pdf-lib";
import { Sparkles, Scissors } from "lucide-react";
import { UploadZone, formatBytes } from "@/components/site/upload-zone";
import { ResultCard } from "@/components/site/result-card";
import { DownloadButton } from "@/components/site/download-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

type Mode = "range" | "each";

interface OutFile {
  blob: Blob;
  filename: string;
  size: number;
}

export default function PdfSplit() {
  const [file, setFile] = React.useState<File | null>(null);
  const [pageCount, setPageCount] = React.useState(0);
  const [mode, setMode] = React.useState<Mode>("range");
  const [rangeFrom, setRangeFrom] = React.useState(1);
  const [rangeTo, setRangeTo] = React.useState(1);
  const [busy, setBusy] = React.useState(false);
  const [outputs, setOutputs] = React.useState<OutFile[]>([]);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setOutputs([]);
    try {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
      setRangeFrom(1);
      setRangeTo(doc.getPageCount());
    } catch {
      toast.error("Could not read PDF");
    }
  };

  const parseRanges = (input: string, max: number): number[][] => {
    // e.g. "1-3,5,7-9"
    return input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((part) => {
        const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
        if (m) {
          const a = parseInt(m[1], 10);
          const b = parseInt(m[2], 10);
          if (a < 1 || b > max || a > b) throw new Error(`Invalid range: ${part}`);
          return [a, b];
        }
        const n = parseInt(part, 10);
        if (Number.isNaN(n) || n < 1 || n > max) throw new Error(`Invalid page: ${part}`);
        return [n, n];
      });
  };

  const split = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const src = await PDFDocument.load(buf, { ignoreEncryption: true });
      const total = src.getPageCount();
      const out: OutFile[] = [];

      if (mode === "range") {
        const from = Math.max(1, Math.min(rangeFrom, total));
        const to = Math.max(from, Math.min(rangeTo, total));
        const outDoc = await PDFDocument.create();
        const pages = await outDoc.copyPages(
          src,
          Array.from({ length: to - from + 1 }, (_, i) => i + from - 1)
        );
        pages.forEach((p) => outDoc.addPage(p));
        const bytes = await outDoc.save();
        out.push({
          blob: new Blob([bytes], { type: "application/pdf" }),
          filename: makeFilename(file.name, `p${from}-${to}`),
          size: bytes.byteLength,
        });
      } else {
        for (let i = 0; i < total; i++) {
          const outDoc = await PDFDocument.create();
          const [page] = await outDoc.copyPages(src, [i]);
          outDoc.addPage(page);
          const bytes = await outDoc.save();
          out.push({
            blob: new Blob([bytes], { type: "application/pdf" }),
            filename: makeFilename(file.name, `p${i + 1}`),
            size: bytes.byteLength,
          });
        }
      }
      setOutputs(out);
      toast.success(`Created ${out.length} file${out.length > 1 ? "s" : ""}`);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not split PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {outputs.length === 0 && (
        <UploadZone
          accept="application/pdf"
          files={file ? [file] : []}
          onFiles={onFiles}
          onClear={() => {
            setFile(null);
            setPageCount(0);
          }}
          label="Drop a PDF, or click to browse"
          hint="Single PDF file"
        />
      )}

      {file && outputs.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <Scissors className="size-5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {pageCount} pages · {formatBytes(file.size)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm">Split mode</Label>
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as Mode)}
              className="space-y-2"
            >
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 has-[:checked]:border-brand has-[:checked]:bg-brand-muted/30">
                <RadioGroupItem value="range" className="mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Extract page range</p>
                  <p className="text-xs text-muted-foreground">
                    Output a single PDF with pages from N to M.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={pageCount}
                      value={rangeFrom}
                      onChange={(e) => setRangeFrom(Number(e.target.value))}
                      className="w-20"
                      aria-label="From page"
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input
                      type="number"
                      min={1}
                      max={pageCount}
                      value={rangeTo}
                      onChange={(e) => setRangeTo(Number(e.target.value))}
                      className="w-20"
                      aria-label="To page"
                    />
                  </div>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 has-[:checked]:border-brand has-[:checked]:bg-brand-muted/30">
                <RadioGroupItem value="each" className="mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Split every page</p>
                  <p className="text-xs text-muted-foreground">
                    Output one PDF per page ({pageCount} files total).
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>

          <Button onClick={split} disabled={busy} className="mt-5 w-full" size="lg">
            <Sparkles className="size-4" />
            {busy ? "Splitting…" : "Split PDF"}
          </Button>
        </div>
      )}

      {outputs.length > 0 && (
        <ResultCard
          status="success"
          title={`Created ${outputs.length} file${outputs.length > 1 ? "s" : ""}`}
          actions={
            <Button
              variant="outline"
              onClick={() => {
                setOutputs([]);
                setFile(null);
              }}
            >
              Split another
            </Button>
          }
        >
          <ul className="space-y-2">
            {outputs.map((o, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <Scissors className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate font-medium">{o.filename}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(o.size)}
                </span>
                <DownloadButton
                  data={o.blob}
                  filename={o.filename}
                  label="Get"
                  size="sm"
                  variant="outline"
                />
              </li>
            ))}
          </ul>
        </ResultCard>
      )}
    </div>
  );
}

function makeFilename(name: string, suffix: string): string {
  const base = name.replace(/\.pdf$/i, "");
  return `${base}_${suffix}.pdf`;
}

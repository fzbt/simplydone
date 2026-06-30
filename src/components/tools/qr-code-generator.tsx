"use client";

import * as React from "react";
import QRCode from "qrcode";
import { DownloadButton } from "@/components/site/download-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { QrCode as QrIcon } from "lucide-react";
import { toast } from "sonner";

export default function QrCodeGenerator() {
  const [text, setText] = React.useState("https://simplydone.app");
  const [size, setSize] = React.useState(320);
  const [fg, setFg] = React.useState("#0c0c0d");
  const [bg, setBg] = React.useState("#ffffff");
  const [level, setLevel] = React.useState<"L" | "M" | "Q" | "H">("M");
  const [dataUrl, setDataUrl] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!text) {
        setDataUrl("");
        return;
      }
      setBusy(true);
      try {
        const url = await QRCode.toDataURL(text, {
          width: size,
          margin: 2,
          color: { dark: fg, light: bg },
          errorCorrectionLevel: level,
        });
        if (!cancelled) setDataUrl(url);
      } catch (e) {
        console.error(e);
        if (!cancelled) toast.error("Could not generate QR code");
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [text, size, fg, bg, level]);

  // Convert data URL to blob for download
  const blob = React.useMemo(() => {
    if (!dataUrl) return null;
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] ?? "image/png";
    const bstr = atob(arr[1]);
    const bytes = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) bytes[i] = bstr.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }, [dataUrl]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="text" className="text-sm">
              Text or URL
            </Label>
            <Input
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://example.com"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Size</Label>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {size}px
              </span>
            </div>
            <Slider
              min={128}
              max={1024}
              step={32}
              value={[size]}
              onValueChange={(v) => setSize(v[0])}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fg" className="text-xs">
                Foreground
              </Label>
              <div className="flex items-center gap-2">
                <input
                  id="fg"
                  type="color"
                  value={fg}
                  onChange={(e) => setFg(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-border bg-card"
                />
                <span className="font-mono text-xs">{fg}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bg" className="text-xs">
                Background
              </Label>
              <div className="flex items-center gap-2">
                <input
                  id="bg"
                  type="color"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-border bg-card"
                />
                <span className="font-mono text-xs">{bg}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Error correction</Label>
            <div className="flex gap-1.5">
              {(["L", "M", "Q", "H"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                    level === l
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Higher levels survive more damage but produce denser codes.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6">
          {dataUrl ? (
            <>
              <img
                src={dataUrl}
                alt="Generated QR code"
                className="size-48 rounded-lg object-contain sm:size-56"
              />
              <p className="mt-3 text-xs text-muted-foreground">
                {size} × {size}px · PNG
              </p>
            </>
          ) : (
            <div className="flex size-48 flex-col items-center justify-center gap-2 text-muted-foreground sm:size-56">
              <QrIcon className="size-12 opacity-40" />
              <p className="text-sm">{busy ? "Generating…" : "Enter text to generate"}</p>
            </div>
          )}
        </div>
      </div>

      <DownloadButton
        data={blob}
        filename="qr-code.png"
        label="Download PNG"
        size="lg"
        className="w-full"
        disabled={!blob}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { PDFDocument } from "pdf-lib";
import { Sparkles, FilePlus, GripVertical, X } from "lucide-react";
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
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { loadImageFromFile } from "@/lib/tools/image-utils";

type PageSize = "fit" | "a4" | "letter";

interface ImgFile {
  id: string;
  file: File;
}

export default function ImageToPdf() {
  const [files, setFiles] = React.useState<ImgFile[]>([]);
  const [pageSize, setPageSize] = React.useState<PageSize>("fit");
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<{ blob: Blob; filename: string } | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const addFiles = (incoming: File[]) => {
    const imgs = incoming.filter((f) => f.type.startsWith("image/"));
    if (imgs.length === 0) {
      toast.error("Please select image files");
      return;
    }
    setFiles((prev) => [
      ...prev,
      ...imgs.map((f) => ({ id: crypto.randomUUID(), file: f })),
    ]);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setFiles((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id);
      const newIndex = prev.findIndex((f) => f.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const build = async () => {
    if (files.length === 0) return;
    setBusy(true);
    try {
      const out = await PDFDocument.create();
      // A4: 595×842 pt, Letter: 612×792 pt (at 72 DPI)
      const SIZES: Record<Exclude<PageSize, "fit">, [number, number]> = {
        a4: [595.28, 841.89],
        letter: [612, 792],
      };

      for (const { file } of files) {
        const img = await loadImageFromFile(file);
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("encode"))),
            file.type === "image/png" ? "image/png" : "image/jpeg",
            0.92
          )
        );
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const embedded =
          file.type === "image/png"
            ? await out.embedPng(bytes)
            : await out.embedJpg(bytes);

        let pageW: number;
        let pageH: number;
        let drawW: number;
        let drawH: number;
        let drawX = 0;
        let drawY = 0;

        if (pageSize === "fit") {
          pageW = embedded.width;
          pageH = embedded.height;
          drawW = embedded.width;
          drawH = embedded.height;
        } else {
          [pageW, pageH] = SIZES[pageSize];
          // Fit image inside page with 24pt margin
          const margin = 24;
          const maxW = pageW - margin * 2;
          const maxH = pageH - margin * 2;
          const ratio = Math.min(maxW / embedded.width, maxH / embedded.height);
          drawW = embedded.width * ratio;
          drawH = embedded.height * ratio;
          drawX = (pageW - drawW) / 2;
          drawY = (pageH - drawH) / 2;
        }

        const page = out.addPage([pageW, pageH]);
        page.drawImage(embedded, { x: drawX, y: drawY, width: drawW, height: drawH });
      }

      const bytes = await out.save();
      setResult({
        blob: new Blob([bytes], { type: "application/pdf" }),
        filename: "images.pdf",
      });
      toast.success(`Built PDF with ${files.length} image${files.length > 1 ? "s" : ""}`);
    } catch (e) {
      console.error(e);
      toast.error("Could not build PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {!result && (
        <>
          <UploadZone
            accept="image/png,image/jpeg,image/webp"
            multiple
            files={files.map((f) => f.file)}
            onFiles={addFiles}
            label="Drop images here, or click to browse"
            hint="PNG, JPG or WebP · drag to reorder"
          />

          {files.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 space-y-1.5">
                <Label className="text-sm">Page size</Label>
                <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSize)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fit">Fit to image (no margins)</SelectItem>
                    <SelectItem value="a4">A4 (portrait)</SelectItem>
                    <SelectItem value="letter">US Letter (portrait)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-2">
                    {files.map((f, i) => (
                      <SortableItem
                        key={f.id}
                        id={f.id}
                        index={i}
                        file={f.file}
                        onRemove={() => setFiles((prev) => prev.filter((p) => p.id !== f.id))}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>

              <Button onClick={build} disabled={busy || files.length === 0} className="mt-5 w-full" size="lg">
                <Sparkles className="size-4" />
                {busy ? "Building…" : `Build PDF from ${files.length} image${files.length > 1 ? "s" : ""}`}
              </Button>
            </div>
          )}
        </>
      )}

      {result && (
        <ResultCard
          status="success"
          title="PDF created"
          actions={
            <>
              <DownloadButton data={result.blob} filename={result.filename} />
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setFiles([]);
                }}
              >
                Build another
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

function SortableItem({
  id,
  index,
  file,
  onRemove,
}: {
  id: string;
  index: number;
  file: File;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-sm",
        isDragging && "shadow-md ring-2 ring-brand/40"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        {index + 1}
      </span>
      <FilePlus className="size-4 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate font-medium">{file.name}</span>
      <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
      <Button variant="ghost" size="icon" className="size-7" onClick={onRemove} aria-label="Remove file">
        <X className="size-4" />
      </Button>
    </li>
  );
}

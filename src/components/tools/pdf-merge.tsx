"use client";

import * as React from "react";
import { PDFDocument } from "pdf-lib";
import { Combine, GripVertical, Sparkles, X } from "lucide-react";
import { UploadZone, formatBytes } from "@/components/site/upload-zone";
import { ResultCard } from "@/components/site/result-card";
import { DownloadButton } from "@/components/site/download-button";
import { Button } from "@/components/ui/button";
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

interface PdfFile {
  id: string;
  file: File;
}

export default function PdfMerge() {
  const [files, setFiles] = React.useState<PdfFile[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<{ blob: Blob; filename: string } | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const addFiles = (incoming: File[]) => {
    const pdfs = incoming.filter((f) => f.type === "application/pdf");
    if (pdfs.length === 0) {
      toast.error("Please select PDF files");
      return;
    }
    setFiles((prev) => [
      ...prev,
      ...pdfs.map((f) => ({ id: crypto.randomUUID(), file: f })),
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

  const merge = async () => {
    if (files.length < 2) {
      toast.error("Add at least 2 PDFs to merge");
      return;
    }
    setBusy(true);
    try {
      const out = await PDFDocument.create();
      for (const { file } of files) {
        const buf = await file.arrayBuffer();
        const src = await PDFDocument.load(buf, { ignoreEncryption: true });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const bytes = await out.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      setResult({ blob, filename: "merged.pdf" });
      toast.success(`Merged ${files.length} PDFs`);
    } catch (e) {
      console.error(e);
      toast.error("Could not merge PDFs");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {!result && (
        <>
          <UploadZone
            accept="application/pdf"
            multiple
            files={files.map((f) => f.file)}
            onFiles={addFiles}
            label="Drop PDFs here, or click to browse"
            hint="Add 2 or more PDFs · drag to reorder"
          />

          {files.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-2">
                    {files.map((f, i) => (
                      <SortableItem
                        key={f.id}
                        id={f.id}
                        index={i}
                        file={f.file}
                        onRemove={() =>
                          setFiles((prev) => prev.filter((p) => p.id !== f.id))
                        }
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>

              <Button onClick={merge} disabled={busy || files.length < 2} className="mt-5 w-full" size="lg">
                <Sparkles className="size-4" />
                {busy ? "Merging…" : `Merge ${files.length} PDF${files.length > 1 ? "s" : ""}`}
              </Button>
            </div>
          )}
        </>
      )}

      {result && (
        <ResultCard
          status="success"
          title="PDF merged"
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
                Merge another
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
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
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
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-rose-500/10 text-xs font-semibold text-rose-600 dark:text-rose-400">
        {index + 1}
      </span>
      <Combine className="size-4 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate font-medium">{file.name}</span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {formatBytes(file.size)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={onRemove}
        aria-label="Remove file"
      >
        <X className="size-4" />
      </Button>
    </li>
  );
}

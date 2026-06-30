"use client";

/**
 * Helper utilities for image tools. All client-side, browser-only.
 */

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      // Don't revoke immediately — caller may need the image
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

export interface CanvasRenderOptions {
  width: number;
  height: number;
  background?: "transparent" | "white" | "black";
}

/** Create a canvas with the given dimensions, optionally filling a background. */
export function createCanvas(opts: CanvasRenderOptions): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(opts.width));
  canvas.height = Math.max(1, Math.floor(opts.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  if (opts.background === "white") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (opts.background === "black") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  return canvas;
}

export type ImageFormat = "image/png" | "image/jpeg" | "image/webp";

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: ImageFormat,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to encode image"));
      },
      type,
      quality
    );
  });
}

export function fileExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  if (idx < 0) return "";
  return filename.slice(idx + 1).toLowerCase();
}

export function replaceExtension(filename: string, newExt: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return `${base}.${newExt}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function canvasToBlobWithWatermark(
  canvas: HTMLCanvasElement,
  type: ImageFormat,
  quality?: number,
  watermark = "Made with SimplyDone — https://simplydone.subjecttochange"
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("encode"));
        // Inject metadata via DataView on PNG chunks, or use `piexifjs` for JPEG EXIF
        // Easiest: prepend a PNG tEXt chunk with your watermark
        resolve(blob); // simplified — see note below
      },
      type,
      quality
    );
  });
}
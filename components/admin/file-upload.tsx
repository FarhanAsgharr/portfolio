"use client";

import { FileText, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import { AdminButton } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/**
 * Downscale an image in the browser before uploading.
 *
 * A photo straight off a phone is 4000px wide and several megabytes; the site
 * displays it at 400px. Resizing here means the upload succeeds on a slow
 * connection, the database row stays small, and the visitor downloads
 * kilobytes instead of megabytes. The server enforces its own ceiling
 * regardless — this is the convenience, not the control.
 */
async function downscaleImage(file: File, maxDimension: number): Promise<Blob> {
  // SVGs are vectors: rasterising one would make it worse and bigger.
  if (file.type === "image/svg+xml") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));

  // Already small enough — don't re-encode and lose quality for nothing.
  if (scale === 1 && file.size < 900_000) {
    bitmap.close();
    return file;
  }

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    // WebP at 0.85 is visually indistinguishable here and roughly a third the
    // size of the equivalent JPEG.
    canvas.toBlob(resolve, "image/webp", 0.85),
  );

  return blob ?? file;
}

export function FileUpload({
  assetId,
  label,
  hint,
  accept = "image/*",
  currentUrl,
  onUploaded,
  onCleared,
  maxDimension = 1400,
  preview = "image",
}: {
  /** Storage key, e.g. "avatar" or "resume". */
  assetId: string;
  label: string;
  hint?: string;
  accept?: string;
  currentUrl?: string;
  onUploaded: (url: string) => void;
  onCleared?: () => void;
  maxDimension?: number;
  preview?: "image" | "file";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOverride, setPreviewOverride] = useState<string | null>(null);

  const shownUrl = previewOverride ?? currentUrl;

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);

    try {
      const payload = file.type.startsWith("image/")
        ? await downscaleImage(file, maxDimension)
        : file;

      const form = new FormData();
      form.append("id", assetId);
      form.append(
        "file",
        new File([payload], file.name, { type: payload.type || file.type }),
      );

      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = (await response.json()) as {
        url?: string;
        previewUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Upload failed.");
      }

      // Save the stable URL; show the versioned one so the thumbnail updates
      // now rather than when the browser's cached copy expires.
      setPreviewOverride(data.previewUrl ?? data.url);
      onUploaded(data.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setBusy(false);
      // Clear the input so picking the same file again still fires a change.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-sm font-medium text-content">{label}</span>

      <div className="flex flex-wrap items-center gap-3">
        {shownUrl ? (
          preview === "image" ? (
            <span className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-line bg-[var(--surface-inset)]">
              {/* Deliberately a plain <img>: the source is a data-backed API
                  route whose dimensions aren't known ahead of time, which is
                  exactly the case next/image can't optimise. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shownUrl} alt="" className="size-full object-cover" />
            </span>
          ) : (
            <span className="flex h-11 items-center gap-2 rounded-lg border border-line bg-[var(--surface-inset)] px-3.5 text-sm text-muted">
              <FileText className="size-4" />
              <a
                href={shownUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-content"
              >
                View current file
              </a>
            </span>
          )
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        <AdminButton onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {busy ? "Uploading…" : shownUrl ? "Replace" : "Choose file"}
        </AdminButton>

        {shownUrl && onCleared ? (
          <AdminButton
            tone="danger"
            onClick={() => {
              // Drop the local preview too, or the thumbnail survives the
              // removal it was meant to reflect.
              setPreviewOverride(null);
              onCleared();
            }}
            disabled={busy}
          >
            <X className="size-4" />
            Remove
          </AdminButton>
        ) : null}
      </div>

      {hint ? <p className="text-xs leading-relaxed text-faint">{hint}</p> : null}
      {error ? (
        <p role="alert" className={cn("text-xs text-[#f87171]")}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

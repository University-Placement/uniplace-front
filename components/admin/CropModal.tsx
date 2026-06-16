"use client";

import { useRef, useState } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { createClient } from "@/lib/supabase/client";

async function toBlob(image: HTMLImageElement, crop: Crop): Promise<Blob> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const px =
    crop.unit === "%"
      ? {
          x: (crop.x / 100) * image.width,
          y: (crop.y / 100) * image.height,
          width: (crop.width / 100) * image.width,
          height: (crop.height / 100) * image.height,
        }
      : { x: crop.x, y: crop.y, width: crop.width, height: crop.height };

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(px.width * scaleX));
  canvas.height = Math.max(1, Math.round(px.height * scaleY));
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    image,
    px.x * scaleX,
    px.y * scaleY,
    px.width * scaleX,
    px.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Export failed"))),
      "image/png",
    ),
  );
}

export function CropModal({
  url,
  onCancel,
  onSaved,
}: {
  url: string;
  onCancel: () => void;
  onSaved: (newUrl: string) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const image = imgRef.current;
    if (!image || !crop || !crop.width || !crop.height) {
      setError("Drag a crop region first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const blob = await toBlob(image, crop);
      const supabase = createClient();
      const objectPath = url.split("/object/public/questions/")[1];
      if (!objectPath) throw new Error("Unrecognized image URL");
      const newPath = objectPath.replace(/\.png$/i, `-c${Date.now()}.png`);
      const { error: upErr } = await supabase.storage
        .from("questions")
        .upload(newPath, blob, { contentType: "image/png", upsert: false });
      if (upErr) throw upErr;
      const newUrl = supabase.storage.from("questions").getPublicUrl(newPath)
        .data.publicUrl;
      onSaved(newUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save crop");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Reframe image</h2>
          <button onClick={onCancel} className="text-muted hover:text-ink">
            ✕
          </button>
        </div>
        <p className="mb-3 text-sm text-muted">
          Drag to select the part you want to keep, then save.
        </p>

        <div className="flex-1 overflow-auto rounded-lg border border-line bg-surface p-2">
          <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
            {/* crossOrigin lets us export the storage image to a canvas */}
            <img
              ref={imgRef}
              src={url}
              crossOrigin="anonymous"
              alt="To crop"
              className="max-w-full"
            />
          </ReactCrop>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-surface"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save crop"}
          </button>
        </div>
      </div>
    </div>
  );
}

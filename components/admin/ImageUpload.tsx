"use client";

import { useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function ImageUpload({
  value,
  onChange,
  folder = "portfolio",
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  hint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="paste URL or upload an image"
          className="flex-1 px-3 py-2 bg-transparent border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
        />
        <label className="px-3 py-2 border border-[var(--color-border)] text-xs font-bold tracking-wider cursor-pointer">
          {uploading ? "..." : "UPLOAD"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={onPick}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-3 py-2 border border-[var(--color-border)] text-xs"
          >
            CLEAR
          </button>
        )}
      </div>
      {hint && (
        <p className="text-[10px] text-[var(--color-text-muted)]">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-700 border border-red-300 bg-red-50 px-3 py-2">
          {error}
        </p>
      )}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="preview"
          className="max-h-40 border border-[var(--color-border)] object-cover"
        />
      )}
    </div>
  );
}

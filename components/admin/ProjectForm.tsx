"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Project } from "@/lib/types";
import TipTapEditor from "@/components/admin/TipTapEditor";
import ImageUpload from "@/components/admin/ImageUpload";

type Props = { initial?: Project };

export default function ProjectForm({ initial }: Props) {
  const router = useRouter();
  const editing = !!initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(", "));
  const [category, setCategory] = useState(initial?.category ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  useEffect(() => {
    api<string[]>("/api/projects/categories")
      .then(setExistingCategories)
      .catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        title,
        slug: slug.trim() || undefined,
        description,
        content,
        coverUrl,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        category: category.trim(),
        featured,
      };
      if (editing && initial) {
        await api(`/api/projects/${initial._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api(`/api/projects`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-2xl">
      <Field label="TITLE">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field
        label="SLUG"
        hint="optional - auto-generated from title if blank"
      >
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={inputCls}
          placeholder="auto"
        />
      </Field>

      <Field label="DESCRIPTION">
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="CONTENT">
        <TipTapEditor value={content} onChange={setContent} />
      </Field>

      <Field label="COVER IMAGE">
        <ImageUpload
          value={coverUrl}
          onChange={setCoverUrl}
          folder="portfolio/projects"
          hint="upload to Cloudinary or paste a /images/... path / URL"
        />
      </Field>

      <Field label="TAGS" hint="comma-separated">
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className={inputCls}
          placeholder="REACT, TS"
        />
      </Field>

      <Field label="CATEGORY" hint="type a new category or pick an existing one">
        <input
          required
          list="category-list"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputCls}
          placeholder="e.g. FRONTEND"
        />
        <datalist id="category-list">
          {existingCategories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>

      <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
        />
        FEATURED
      </label>

      {error && (
        <p className="text-xs text-red-700 border border-red-300 bg-red-50 px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 bg-[var(--color-primary)] text-white text-sm font-bold tracking-wider disabled:opacity-60"
        >
          {submitting ? "SAVING..." : editing ? "UPDATE" : "CREATE"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className="px-5 py-2 border border-[var(--color-border)] text-sm"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full px-3 py-2 bg-transparent border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs mb-1 text-[var(--color-text-secondary)] tracking-wider">
        {label}
        {hint && (
          <span className="ml-2 normal-case text-[var(--color-text-muted)]">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

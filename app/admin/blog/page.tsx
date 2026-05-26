import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import type { BlogPost } from "@/lib/types";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await apiServer<BlogPost[]>("/api/blogs?all=1");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">BLOG</h1>
        <Link
          href="/admin/blog/new"
          className="px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-bold tracking-wider"
        >
          + NEW
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No posts yet</p>
      ) : (
        <table className="w-full text-sm border border-[var(--color-border)]">
          <thead className="bg-[var(--color-surface)] text-xs uppercase">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p._id} className="border-t border-[var(--color-border)]">
                <td className="p-3">{p.title}</td>
                <td className="p-3 text-xs">
                  {p.published ? (
                    <span className="text-[var(--color-primary)] font-bold">
                      PUBLISHED
                    </span>
                  ) : (
                    <span className="text-[var(--color-text-muted)] font-bold">
                      DRAFT
                    </span>
                  )}
                </td>
                <td className="p-3 text-xs text-[var(--color-text-muted)]">
                  {p.slug}
                </td>
                <td className="p-3 text-right">
                  <div className="inline-flex gap-2">
                    <Link
                      href={`/admin/blog/${p._id}`}
                      className="text-[10px] font-bold tracking-wider border border-[var(--color-border)] px-2 py-1"
                    >
                      EDIT
                    </Link>
                    <DeleteButton path={`/api/blogs/${p._id}`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

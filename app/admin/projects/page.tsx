import Link from "next/link";
import { getProjects } from "@/lib/api";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">PROJECTS</h1>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-bold tracking-wider"
        >
          + NEW
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          No Projects yet.
        </p>
      ) : (
        <table className="w-full text-sm border border-[var(--color-border)]">
          <thead className="bg-[var(--color-surface)] text-xs uppercase">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p._id} className="border-t border-[var(--color-border)]">
                <td className="p-3">
                  {p.title}
                  {p.featured && (
                    <span className="ml-2 text-[10px] bg-[var(--color-primary)] text-white px-1.5 py-0.5">
                      FEATURED
                    </span>
                  )}
                </td>
                <td className="p-3 text-xs">{p.category}</td>
                <td className="p-3 text-xs text-[var(--color-text-muted)]">
                  {p.slug}
                </td>
                <td className="p-3 text-right">
                  <div className="inline-flex gap-2">
                    <Link
                      href={`/admin/projects/${p._id}`}
                      className="text-[10px] font-bold tracking-wider border border-[var(--color-border)] px-2 py-1"
                    >
                      EDIT
                    </Link>
                    <DeleteButton path={`/api/projects/${p._id}`} />
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

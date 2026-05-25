import type { Metadata } from "next";
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export const metadata: Metadata = { title: "Admin" };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[70vh] px-6 py-10 max-w-5xl mx-auto">
      <header className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-8">
        <nav className="flex gap-6 text-sm">
          <Link href="/admin" className="font-bold">Admin</Link>
          <Link href="/admin/projects">Projects</Link>
          <Link href="/admin/blog">Blog</Link>
          <Link href="/admin/submissions">Submissions</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
          >
            VIEW SITE
          </Link>
          <LogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}

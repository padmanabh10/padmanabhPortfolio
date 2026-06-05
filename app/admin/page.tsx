import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import { getProjects, getBlogs } from "@/lib/api";
import DismissButton from "@/components/admin/DismissButton";

export const dynamic = "force-dynamic";

interface LoginAttemptItem {
  _id: string;
  ip: string;
  email: string;
  userAgent: string;
  createdAt: string;
}

interface ContactItem {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  handled: boolean;
  createdAt: string;
}

interface SubscriberItem {
  _id: string;
  email: string;
  createdAt: string;
}

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export default async function AdminHome() {
  const [projects, blogs, contacts, subscribers, suspicious] = await Promise.all([
    getProjects(),
    getBlogs({ all: true }),
    apiServer<ContactItem[]>("/api/contact").catch(() => []),
    apiServer<SubscriberItem[]>("/api/subscribe").catch(() => []),
    apiServer<LoginAttemptItem[]>("/api/auth/suspicious").catch(() => []),
  ]);

  const unhandled = contacts.filter((c) => !c.handled);
  const published = blogs.filter((b) => b.published);
  const drafts = blogs.filter((b) => !b.published);

  const stats = [
    { label: "PROJECTS", value: String(projects.length), href: "/admin/projects" },
    { label: "PUBLISHED", value: String(published.length), href: "/admin/blog" },
    { label: "DRAFTS", value: String(drafts.length), href: "/admin/blog" },
    { label: "SUBSCRIBERS", value: String(subscribers.length), href: "/admin/submissions" },
    { label: "UNREAD", value: String(unhandled.length), href: "/admin/submissions" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-1">ADMIN DASHBOARD</h1>
        <p className="text-xs text-[var(--color-text-muted)]">Overview</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="border border-[var(--color-border)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <p className="font-heading text-3xl text-[var(--color-text)]">
              {s.value}
            </p>
            <p className="font-mono text-[10px] font-bold text-[var(--color-text-muted)] mt-1 tracking-wider">
              {s.label}
            </p>
          </Link>
        ))}
      </div>

      {unhandled.length > 0 && (
        <section>
          <h2 className="font-bold text-sm tracking-wider mb-3">
            RECENT UNREAD ({unhandled.length})
          </h2>
          <ul className="space-y-2">
            {unhandled.slice(0, 5).map((c) => (
              <li
                key={c._id}
                className="border border-[var(--color-border)] p-3 flex flex-wrap items-baseline justify-between gap-2"
              >
                <div className="text-sm">
                  <strong>{c.name}</strong>{" "}
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {c.subject}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {fmt(c.createdAt)}
                </span>
              </li>
            ))}
          </ul>
          {unhandled.length > 5 && (
            <Link
              href="/admin/submissions"
              className="block mt-2 text-xs text-[var(--color-primary)] font-bold"
            >
              + {unhandled.length - 5} more →
            </Link>
          )}
        </section>
      )}

      {suspicious.length > 0 && (
        <section>
          <h2 className="font-bold text-sm tracking-wider mb-3 text-red-700">
            SUSPICIOUS LOGIN ATTEMPTS ({suspicious.length})
          </h2>
          <ul className="space-y-2">
            {suspicious.map((a) => (
              <li
                key={a._id}
                className="border border-red-200 bg-red-50 p-3 text-xs space-y-1"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex gap-3">
                    <span className="font-bold text-red-700">{a.ip}</span>
                    {a.email && (
                      <span className="text-[var(--color-text-muted)]">
                        tried: <span className="text-[var(--color-text)]">{a.email}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[var(--color-text-muted)]">{fmt(a.createdAt)}</span>
                    <DismissButton id={a._id} />
                  </div>
                </div>
                {a.userAgent && (
                  <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                    {a.userAgent}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-bold text-sm tracking-wider">LATEST PROJECTS</h2>
            <Link
              href="/admin/projects/new"
              className="text-[10px] font-bold text-[var(--color-primary)]"
            >
              + NEW
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">none</p>
          ) : (
            <ul className="space-y-1">
              {projects.slice(0, 5).map((p) => (
                <li key={p._id}>
                  <Link
                    href={`/admin/projects/${p._id}`}
                    className="flex items-baseline justify-between border border-[var(--color-border)] px-3 py-2 hover:border-[var(--color-primary)] transition-colors"
                  >
                    <span className="text-sm truncate">{p.title}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] shrink-0 ml-2">
                      {p.category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-bold text-sm tracking-wider">LATEST POSTS</h2>
            <Link
              href="/admin/blog/new"
              className="text-[10px] font-bold text-[var(--color-primary)]"
            >
              + NEW
            </Link>
          </div>
          {blogs.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">none</p>
          ) : (
            <ul className="space-y-1">
              {blogs.slice(0, 5).map((b) => (
                <li key={b._id}>
                  <Link
                    href={`/admin/blog/${b._id}`}
                    className="flex items-baseline justify-between border border-[var(--color-border)] px-3 py-2 hover:border-[var(--color-primary)] transition-colors"
                  >
                    <span className="text-sm truncate">{b.title}</span>
                    <span
                      className={`text-[10px] shrink-0 ml-2 font-bold ${
                        b.published
                          ? "text-[var(--color-primary)]"
                          : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {b.published ? "LIVE" : "DRAFT"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

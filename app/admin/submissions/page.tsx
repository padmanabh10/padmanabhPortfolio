import { apiServer } from "@/lib/api-server";
import DeleteButton from "@/components/admin/DeleteButton";
import HandledToggle from "@/components/admin/HandledToggle";

export const dynamic = "force-dynamic";

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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SubmissionsPage() {
  let contacts: ContactItem[] = [];
  let subscribers: SubscriberItem[] = [];
  let error: string | null = null;

  try {
    [contacts, subscribers] = await Promise.all([
      apiServer<ContactItem[]>("/api/contact"),
      apiServer<SubscriberItem[]>("/api/subscribe"),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load";
  }

  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="text-2xl font-bold">SUBMISSIONS</h1>
          <span className="text-xs text-[var(--color-text-muted)]">
            {contacts.length} contact / {subscribers.length} subscribers
          </span>
        </div>
        {error && (
          <p className="text-xs text-red-700 border border-red-300 bg-red-50 px-3 py-2 mb-4">
            {error}
          </p>
        )}
      </div>

      <section>
        <h2 className="font-bold mb-3 text-sm tracking-wider">CONTACT MESSAGES</h2>
        {contacts.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">empty</p>
        ) : (
          <ul className="space-y-3">
            {contacts.map((c) => (
              <li
                key={c._id}
                className={`border border-[var(--color-border)] p-4 ${
                  c.handled ? "opacity-60" : ""
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                  <div className="text-sm">
                    <strong>{c.name}</strong>{" "}
                    <a
                      href={`mailto:${c.email}`}
                      className="text-[var(--color-primary)] underline"
                    >
                      {c.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                    <span>{fmt(c.createdAt)}</span>
                    <HandledToggle id={c._id} handled={c.handled} />
                    <DeleteButton path={`/api/contact/${c._id}`} />
                  </div>
                </div>
                <div className="text-[10px] tracking-wider text-[var(--color-text-secondary)] mb-2">
                  SUBJECT: {c.subject}
                  {c.handled && (
                    <span className="ml-2 bg-[var(--color-surface)] px-1.5 py-0.5">
                      HANDLED
                    </span>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {c.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-bold mb-3 text-sm tracking-wider">SUBSCRIBERS</h2>
        {subscribers.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">empty</p>
        ) : (
          <table className="w-full text-sm border border-[var(--color-border)]">
            <thead className="bg-[var(--color-surface)] text-xs uppercase">
              <tr>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Joined</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr
                  key={s._id}
                  className="border-t border-[var(--color-border)]"
                >
                  <td className="p-3">{s.email}</td>
                  <td className="p-3 text-xs text-[var(--color-text-muted)]">
                    {fmt(s.createdAt)}
                  </td>
                  <td className="p-3 text-right">
                    <DeleteButton path={`/api/subscribe/${s._id}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

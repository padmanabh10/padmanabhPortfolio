"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";

export default function PadmanabhLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const search = useSearchParams();
  const from = search.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api<{ user: { id: string; email: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      // Hard navigation — ensures the browser sends the newly-set pk_auth
      // cookie on the next request so middleware lets /admin through.
      window.location.assign(from);
      return;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8"
      >
        <h1 className="text-xl font-bold mb-1 text-[var(--color-text)]">
          ADMIN LOGIN
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mb-6">
          Restricted Access
        </p>

        <label className="block text-xs mb-1 text-[var(--color-text-secondary)]">
          EMAIL
        </label>
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 bg-transparent border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
        />

        <label className="block text-xs mb-1 text-[var(--color-text-secondary)]">
          PASSWORD
        </label>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-3 py-2 bg-transparent border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
        />

        {error && (
          <p className="text-xs mb-4 text-red-700 border border-red-300 bg-red-50 px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-[var(--color-primary)] text-[var(--color-tag-text)] text-sm font-bold tracking-wider disabled:opacity-60"
        >
          {submitting ? "SIGNING IN..." : "SIGN IN"}
        </button>
      </form>
    </div>
  );
}

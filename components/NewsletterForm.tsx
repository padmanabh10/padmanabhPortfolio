"use client";

import { useState, type FormEvent } from "react";
import { api, ApiError } from "@/lib/api";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "sending" }
    | { kind: "sent" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus({ kind: "sending" });
    try {
      const res = await api<{ ok: boolean; error?: string }>("/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setStatus({ kind: "error", message: res.error ?? "Unable to subscribe" });
        return;
      }
      setStatus({ kind: "sent" });
      setEmail("");
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof ApiError ? err.message : "Failed to subscribe",
      });
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 w-full md:w-auto"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="YOUR EMAIL ADDRESS"
          className="bg-white/10 border border-white/20 text-white font-mono text-xs px-4 py-3 placeholder:text-white/40 outline-none focus:border-white/60 w-full sm:w-64"
        />
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="bg-white text-primary font-mono text-xs font-bold tracking-wider px-6 py-3 hover:bg-white/90 transition-colors whitespace-nowrap disabled:opacity-60"
        >
          {status.kind === "sending" ? "..." : "SUBSCRIBE"}
        </button>
      </div>
      {status.kind === "sent" && (
        <p className="font-mono text-[10px] text-white/80">
          SUBSCRIBED - Thanks.
        </p>
      )}
      {status.kind === "error" && (
        <p className="font-mono text-[10px] text-white/90 bg-red-700/30 px-2 py-1">
          {status.message}
        </p>
      )}
    </form>
  );
}

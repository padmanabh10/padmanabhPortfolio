"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function LogoutButton() {
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore - still redirect
    }
    window.location.assign("/padmanabh-login");
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="text-xs border border-[var(--color-border)] px-3 py-1 disabled:opacity-60"
    >
      {pending ? "..." : "LOGOUT"}
    </button>
  );
}

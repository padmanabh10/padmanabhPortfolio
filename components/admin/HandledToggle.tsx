"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

export default function HandledToggle({
  id,
  handled,
}: {
  id: string;
  handled: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    try {
      await api(`/api/contact/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ handled: !handled }),
      });
      router.refresh();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`text-[10px] font-bold tracking-wider border px-2 py-1 disabled:opacity-60 ${
        handled
          ? "border-[var(--color-border)]"
          : "border-[var(--color-primary)] text-[var(--color-primary)]"
      }`}
    >
      {pending ? "..." : handled ? "MARK OPEN" : "MARK HANDLED"}
    </button>
  );
}

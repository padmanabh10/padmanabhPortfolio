"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

export default function DeleteButton({
  path,
  label = "DELETE",
  confirmMessage = "Delete this item? This cannot be undone.",
}: {
  path: string;
  label?: string;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!confirm(confirmMessage)) return;
    setPending(true);
    try {
      await api(path, { method: "DELETE" });
      router.refresh();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="text-[10px] font-bold tracking-wider border border-red-300 text-red-700 px-2 py-1 disabled:opacity-60"
    >
      {pending ? "..." : label}
    </button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

export default function DismissButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function dismiss() {
    setPending(true);
    try {
      await api(`/api/auth/suspicious/${id}/dismiss`, { method: "PATCH" });
      router.refresh();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to dismiss");
      setPending(false);
    }
  }

  return (
    <button
      onClick={dismiss}
      disabled={pending}
      className="text-[10px] font-bold tracking-wider border border-red-300 text-red-600 px-2 py-0.5 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-40"
    >
      {pending ? "..." : "IGNORE"}
    </button>
  );
}

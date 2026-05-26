"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { api } from "@/lib/api";

function UnsubscribeContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    const email = params.get("email") ?? "";
    const token = params.get("token") ?? "";

    if (!email || !token) {
      setStatus("error");
      return;
    }

    api(`/api/subscribe/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`)
      .then(() => setStatus("done"))
      .catch(() => setStatus("error"));
  }, [params]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-8">
      <div className="text-center max-w-md">
        {status === "loading" && (
          <p className="font-mono text-sm text-text-muted">PROCESSING...</p>
        )}
        {status === "done" && (
          <>
            <h1 className="font-heading text-4xl md:text-5xl uppercase text-text mb-4">
              UNSUBSCRIBED
            </h1>
            <p className="font-mono text-sm text-text-secondary">
              You have been removed from the mailing list. You will no longer
              receive email notifications.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="font-heading text-4xl md:text-5xl uppercase text-text mb-4">
              INVALID LINK
            </h1>
            <p className="font-mono text-sm text-text-secondary">
              This unsubscribe link is invalid or has already been used.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="font-mono text-sm text-text-muted">LOADING...</p>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}

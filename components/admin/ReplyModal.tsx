"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Props {
  id: string;
  toName: string;
  toEmail: string;
  subject: string;
}

export default function ReplyModal({ id, toName, toEmail, subject }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function send() {
    if (!body.trim()) return;
    setStatus("sending");
    try {
      await api(`/api/contact/${id}/reply`, {
        method: "POST",
        body: JSON.stringify({ body: body.trim() }),
      });
      await api(`/api/contact/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ handled: true }),
      });
      setStatus("sent");
      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 1000);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to send");
      setStatus("error");
    }
  }

  function close() {
    setOpen(false);
    setStatus("idle");
    setBody("");
    setErrorMsg("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] font-bold tracking-wider border border-[var(--color-primary)] text-[var(--color-primary)] px-2 py-1 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
      >
        REPLY
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,31,16,0.55)" }}
        >
          <div className="w-full max-w-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]">
              <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)]">
                COMPOSE REPLY
              </span>
              <button
                onClick={close}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {/* To / Subject */}
              <div className="text-[10px] text-[var(--color-text-muted)] space-y-1">
                <p>
                  <span className="tracking-wider">TO</span>{" "}
                  <span className="text-[var(--color-text)]">
                    {toName} &lt;{toEmail}&gt;
                  </span>
                </p>
                <p>
                  <span className="tracking-wider">SUBJECT</span>{" "}
                  <span className="text-[var(--color-text)]">Re: {subject}</span>
                </p>
              </div>

              {/* Fixed opening */}
              <div className="text-sm text-[var(--color-text-secondary)] border-l-2 border-[var(--color-surface)] pl-3 space-y-1 select-none">
                <p>Hi {toName},</p>
                <p>Thanks for reaching out — here&apos;s my reply to your message.</p>
              </div>

              {/* Editable body */}
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your reply here..."
                rows={8}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] resize-y outline-none focus:border-[var(--color-primary)] font-mono"
              />

              {/* Fixed closing */}
              <div className="text-sm text-[var(--color-text-secondary)] border-l-2 border-[var(--color-surface)] pl-3 space-y-0.5 select-none">
                <p>Best regards,</p>
                <p className="font-bold text-[var(--color-primary)]">Padmanabh Kulkarni.</p>
              </div>

              {status === "error" && (
                <p className="text-xs text-red-600 border border-red-300 bg-red-50 px-3 py-2">
                  {errorMsg}
                </p>
              )}
              {status === "sent" && (
                <p className="text-xs text-[var(--color-primary)] border border-[var(--color-border)] px-3 py-2">
                  Reply sent successfully.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--color-border)]">
              <button
                onClick={close}
                className="text-[10px] font-bold tracking-wider px-3 py-1.5 border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]"
              >
                CANCEL
              </button>
              {status !== "sent" ? (
                <button
                  onClick={send}
                  disabled={status === "sending" || !body.trim()}
                  className="text-[10px] font-bold tracking-wider px-4 py-1.5 bg-[var(--color-primary)] text-white disabled:opacity-40"
                >
                  {status === "sending" ? "SENDING..." : "SEND"}
                </button>
              ) : (
                <button
                  onClick={close}
                  className="text-[10px] font-bold tracking-wider px-4 py-1.5 bg-[var(--color-primary)] text-white"
                >
                  CLOSE
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

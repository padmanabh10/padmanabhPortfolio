"use client";

import Image from "next/image";
import { useState, useEffect, type FormEvent } from "react";
import { api, ApiError } from "@/lib/api";

const channels: { label: string; href: string; icon?: string }[] = [
  { label: "GITHUB", href: "https://github.com/padmanabh10", icon: "/images/github.png" },
  { label: "LINKEDIN", href: "https://www.linkedin.com/in/padmanabhpk", icon: "/images/linkedin.png" },
  { label: "PERSONAL BLOG", href: "/blog" },
  { label: "EMAIL ME", href: "mailto:officialpadmanabh@gmail.com" },
];

const subjects = [
  "PROJECT COLLABORATION",
  "TECHNICAL CONSULTATION",
  "FREELANCE INQUIRY",
  "JOB OPPORTUNITY",
];

export default function ContactPage() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [available, setAvailable] = useState<"available" | "sleeping" | "busy">("busy");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(subjects[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "sending" }
    | { kind: "sent" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (email.trim().toLowerCase() === "officialpadmanabh@gmail.com") {
      setStatus({ kind: "error", message: "Trying to act smart? That's my email." });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      await api("/api/contact", {
        method: "POST",
        body: JSON.stringify({ name, email, subject, message }),
      });
      setStatus({ kind: "sent" });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof ApiError ? err.message : "Failed to send",
      });
    }
  }

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setDate(
        now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).toUpperCase()
      );
      const hour = now.getHours();
      setAvailable(hour >= 19 && hour < 22 ? "available" : (hour >= 22 || hour < 7) ? "sleeping" : "busy");
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Header */}
      <section className="px-8 md:px-24 pt-16 pb-12">
        <h1 className="font-heading text-6xl md:text-8xl uppercase text-text leading-none">
          GET IN
          <br />
          TOUCH
        </h1>
        <p className="font-mono text-sm text-text-secondary mt-6 max-w-xl uppercase leading-relaxed">
          USE THIS FORM TO
          REACH OUT FOR PROJECT COLLABORATIONS, TECHNICAL CONSULTING,
          OR CAREER OPPORTUNITIES.
        </p>
      </section>

      {/* Main content */}
      <section className="px-8 md:px-24 pb-16 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Form */}
        <div className="md:col-span-3 bg-bg-card border border-border p-8">
          <h2 className="font-heading text-2xl uppercase text-text mb-8">
            MESSAGE INTERFACE
          </h2>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-mono text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                  YOUR NAME
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="FULL NAME"
                  className="w-full bg-surface border-none font-mono text-xs text-text px-4 py-3 placeholder:text-text-muted outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL@DOMAIN.COM"
                  className="w-full bg-surface border-none font-mono text-xs text-text px-4 py-3 placeholder:text-text-muted outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="font-mono text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                SUBJECT
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-surface border-none font-mono text-xs text-text px-4 py-3 outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                MESSAGE
              </label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="WRITE YOUR MESSAGE..."
                className="w-full bg-surface border-none font-mono text-xs text-text px-4 py-3 placeholder:text-text-muted outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {status.kind === "sent" && (
              <p className="font-mono text-xs text-primary border border-primary px-3 py-2">
                MESSAGE RECEIVED — I&apos;ll get back to you soon.
              </p>
            )}
            {status.kind === "error" && (
              <p className="font-mono text-xs text-red-700 border border-red-300 bg-red-50 px-3 py-2">
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={status.kind === "sending"}
              className="w-full bg-primary text-white font-mono text-sm font-bold tracking-widest py-4 hover:bg-primary-dark transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {status.kind === "sending" ? "SENDING..." : "SEND MESSAGE"}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-2 space-y-6">
          {/* Location */}
          <div className="bg-bg-card border border-border p-6">
            <h3 className="font-heading text-xl uppercase text-text mb-4">
              AVAILABILITY
            </h3>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-text-muted">
                LOCAL DATE
              </span>
              <span className="font-heading text-2xl text-primary tabular-nums">
                {date}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-mono text-xs text-text-muted">
                LOCAL TIME
              </span>
              <span className="font-heading text-2xl text-primary tabular-nums">
                {time}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-mono text-xs text-text-muted">STATUS</span>
              <span className={`font-mono text-sm font-bold ${available === "available" ? "text-primary" : available === "sleeping" ? "text-text-muted" : "text-red-400"}`}>
                {available === "available" ? "AVAILABLE" : available === "sleeping" ? "zzzzz..." : "PROBABLY DEBUGGING SOMETHING"}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-mono text-xs text-text-muted">HOURS</span>
              <span className="font-mono text-sm font-bold text-primary">
                7:00 PM - 10:00 PM
              </span>
            </div>
          </div>

          {/* Social links */}
          <div className="bg-bg-card border border-border p-6">
            <h3 className="font-heading text-xl uppercase text-text mb-4">
              CONNECT
            </h3>
            <div className="divide-y divide-border">
              {channels.map((ch) => (
                <a
                  key={ch.label}
                  href={ch.href}
                  target={ch.href.startsWith("http") ? "_blank" : undefined}
                  className="flex items-center justify-between py-3 group"
                >
                  <span className="font-mono text-sm font-bold text-text group-hover:text-primary transition-colors flex items-center gap-3">
                    {ch.icon && (
                      <Image
                        src={ch.icon}
                        alt=""
                        width={18}
                        height={18}
                        className="object-contain"
                      />
                    )}
                    {ch.label}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-text-muted group-hover:text-primary transition-colors"
                  >
                    <path
                      d="M7 17L17 7M17 7H7M17 7V17"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

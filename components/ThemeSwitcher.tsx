"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { themes } from "@/lib/themes";
import { ThemedImage } from "@/components/ThemedImage";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={ref} className="relative z-20">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch theme"
        title="Switch theme"
        className="w-6 h-6 transition-all cursor-pointer hover:scale-110"
      >
        <ThemedImage imageKey="paletteIcon" alt="Switch theme" width={24} height={24} />
      </button>

      {open && (
        <div className="absolute right-0 top-9 bg-bg-card border border-border shadow-xl p-2 w-44 flex flex-col gap-0.5">
          {themes.map((t) => {
            const active = theme.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false); }}
                className={`flex items-center gap-2.5 px-3 py-2 font-mono text-[11px] font-bold tracking-wider uppercase text-left transition-colors w-full hover:bg-surface ${active ? "text-primary" : "text-text-secondary"}`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: t.vars["--color-primary"] }}
                />
                {t.name}
                {active && (
                  <svg className="ml-auto w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ThemeSwitcherInline() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-1 w-full">
      <p className="font-mono text-[10px] font-bold tracking-widest text-text-muted uppercase mb-1">
        Theme
      </p>
      {themes.map((t) => {
        const active = theme.id === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`flex items-center gap-2.5 px-3 py-2 font-mono text-[11px] font-bold tracking-wider uppercase text-left transition-colors w-full border ${active ? "border-primary text-primary bg-accent-bg" : "border-transparent text-text-secondary hover:bg-surface"}`}
          >
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: t.vars["--color-primary"] }}
            />
            {t.name}
            {active && (
              <svg className="ml-auto w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

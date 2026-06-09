"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { themes, DEFAULT_THEME_ID, getThemeById, type Theme } from "@/lib/themes";

const STORAGE_KEY = "portfolio-theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: getThemeById(DEFAULT_THEME_ID),
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState(DEFAULT_THEME_ID);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && themes.find((t) => t.id === saved)) {
        setThemeId(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const theme = getThemeById(themeId);
    const root = document.documentElement;
    for (const [key, value] of Object.entries(theme.vars)) {
      root.style.setProperty(key, value);
    }

    let styleEl = document.getElementById("theme-scrollbar") as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "theme-scrollbar";
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `::-webkit-scrollbar-track{background:${theme.vars["--color-surface"]}}::-webkit-scrollbar-thumb{background:${theme.vars["--color-primary"]}}`;

    const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (favicon) {
      favicon.href = theme.images.favicon;
    } else {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = theme.images.favicon;
      document.head.appendChild(link);
    }

    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch {}
  }, [themeId]);

  function setTheme(id: string) {
    if (themes.find((t) => t.id === id)) setThemeId(id);
  }

  return (
    <ThemeContext.Provider value={{ theme: getThemeById(themeId), setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

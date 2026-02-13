import { useState, useEffect, useCallback } from "react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "kisansetu-theme";

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return stored || "dark";
  });

  const applyTheme = useCallback((theme: ThemeMode) => {
    const root = document.documentElement;
    root.style.transition = "background-color 300ms ease, color 300ms ease, border-color 300ms ease";
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // Clean up transition after it completes
    setTimeout(() => {
      root.style.transition = "";
    }, 350);
  }, []);

  useEffect(() => {
    applyTheme(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode, applyTheme]);

  return { mode, setMode, resolvedTheme: mode };
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  applyThemeToDocument,
  readStoredPreference,
  resolveTheme,
  writeStoredPreference,
} from "../theme/storage.js";

/** @typedef {import('../theme/storage.js').ThemePreference} ThemePreference */

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(() => readStoredPreference());
  const [systemEpoch, setSystemEpoch] = useState(0);

  const resolvedTheme = useMemo(() => {
    if (preference === "system") {
      void systemEpoch;
      return resolveTheme("system");
    }
    return resolveTheme(preference);
  }, [preference, systemEpoch]);

  useEffect(() => {
    applyThemeToDocument(resolvedTheme, preference);
  }, [resolvedTheme, preference]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => setSystemEpoch((n) => n + 1);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setPreference = useCallback((next) => {
    setPreferenceState(next);
    writeStoredPreference(next);
  }, []);

  const value = useMemo(
    () => ({
      preference,
      resolvedTheme,
      setPreference,
      /** Cycle: system → light → dark → system */
      cyclePreference: () => {
        const order = /** @type {const} */ (["system", "light", "dark"]);
        const i = order.indexOf(preference);
        const next = order[(i + 1) % order.length];
        setPreferenceState(next);
        writeStoredPreference(next);
      },
    }),
    [preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

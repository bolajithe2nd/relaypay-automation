export const THEME_STORAGE_KEY = "relaypay-theme-preference";

/** @typedef {'system' | 'light' | 'dark'} ThemePreference */

/** @returns {ThemePreference} */
export function readStoredPreference() {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "system";
}

/** @param {ThemePreference} pref */
export function writeStoredPreference(pref) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    /* ignore */
  }
}

export function getSystemTheme() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/** @param {ThemePreference} preference */
export function resolveTheme(preference) {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return getSystemTheme();
}

/** @param {'light' | 'dark'} resolved @param {ThemePreference} preference */
export function applyThemeToDocument(resolved, preference) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = preference;
}

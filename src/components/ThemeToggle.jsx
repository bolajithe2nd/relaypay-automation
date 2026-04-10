import { useTheme } from "../context/ThemeContext.jsx";

const labels = {
  system: "Theme: System",
  light: "Theme: Light",
  dark: "Theme: Dark",
};

export default function ThemeToggle() {
  const { preference, cyclePreference } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={cyclePreference}
      title={labels[preference]}
      aria-label={labels[preference]}
    >
      {preference === "system" ? (
        <span className="theme-toggle-icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </span>
      ) : preference === "light" ? (
        <span className="theme-toggle-icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        </span>
      ) : (
        <span className="theme-toggle-icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>
      )}
      <span className="theme-toggle-label">{preference === "system" ? "Auto" : preference === "light" ? "Light" : "Dark"}</span>
    </button>
  );
}

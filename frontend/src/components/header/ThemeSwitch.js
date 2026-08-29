import React from "react";
import { useStoreSettings } from "../../context/StoreSettings";

/** The dark / light pair — the active half is filled acid, same pattern as LanguageSwitch. */
export default function ThemeSwitch() {
  const { theme, setTheme } = useStoreSettings();

  const half = (mode, label) => {
    const active = theme === mode;
    return (
      <button
        key={mode}
        type="button"
        onClick={() => setTheme(mode)}
        aria-pressed={active}
        className={`flex items-center px-2.5 font-mono text-[10px] font-semibold tracking-badge transition-colors ${
          active ? "bg-acid text-void" : "text-dim hover:text-ink"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-9 flex-none border border-line" role="group" aria-label="Theme">
      {half("dark", "DARK")}
      {half("light", "LIGHT")}
    </div>
  );
}

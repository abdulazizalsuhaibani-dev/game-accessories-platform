import React from "react";
import { useStoreSettings } from "../../context/StoreSettings";

/** The EN / ع pair — the active half is filled acid. */
export default function LanguageSwitch() {
  const { locale, setLocale } = useStoreSettings();

  const half = (code, label) => {
    const active = locale === code;
    return (
      <button
        key={code}
        type="button"
        onClick={() => setLocale(code)}
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
    <div className="flex h-9 flex-none border border-line" role="group" aria-label="Language">
      {half("en", "EN")}
      {half("ar", "ع")}
    </div>
  );
}

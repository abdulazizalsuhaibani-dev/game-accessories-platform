import React, { useEffect, useRef, useState } from "react";
import { CURRENCIES } from "../../i18n/currencies";
import { useStoreSettings } from "../../context/StoreSettings";

/**
 * The USD $ ▾ control from the header, opening the two-section currency panel
 * (majors, then the pegged Gulf set) with its hard drop shadow.
 */
export default function CurrencyMenu({ compact = false }) {
  const { currency, currencyMeta, setCurrency, locale, t } = useStoreSettings();
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (!wrapper.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const majors = CURRENCIES.filter((c) => !c.gulf);
  const gulf = CURRENCIES.filter((c) => c.gulf);

  const renderRow = (option) => {
    const active = option.code === currency;
    return (
      <button
        key={option.code}
        type="button"
        onClick={() => {
          setCurrency(option.code);
          setOpen(false);
        }}
        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-start transition-colors ${
          active ? "bg-acid" : "hover:bg-well"
        }`}
      >
        <span
          className={`w-9 flex-none font-mono text-[10px] font-semibold tracking-badge ${
            active ? "text-void" : "text-ink"
          }`}
          dir="ltr"
        >
          {option.code}
        </span>
        <span className={`flex-1 text-xs ${active ? "text-void" : "text-dim"}`}>
          {locale === "ar" ? option.nameAr : option.name}
        </span>
        <span
          className={`font-mono text-[11px] ${active ? "text-void" : "text-muted"}`}
        >
          {option.symbol}
        </span>
      </button>
    );
  };

  return (
    <div className="relative flex-none" ref={wrapper}>
      <button
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("nav.currency")}
        className={`flex h-9 items-center gap-2 whitespace-nowrap border px-3 font-mono text-[10px] font-semibold tracking-badge text-ink transition-colors ${
          open ? "border-acid" : "border-line hover:border-edge"
        }`}
      >
        <span dir="ltr">
          {/* Narrow viewports drop the three-letter code and keep the symbol. */}
          {compact ? null : <span className="max-sm:hidden">{currencyMeta.code} </span>}
          {currencyMeta.symbol}
        </span>
        <span className="text-muted" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute top-10 end-0 z-40 w-[264px] border border-acid bg-panel shadow-menu"
        >
          <div className="border-b border-line px-3 py-2.5 telemetry text-[10px] text-muted">
            {t("nav.currency")}
          </div>
          {majors.map(renderRow)}
          <div className="border-y border-line px-3 py-2.5 telemetry text-[10px] text-muted">
            {t("nav.gulf")}
          </div>
          {gulf.map(renderRow)}
          <div className="border-t border-line px-3 py-2.5 font-mono text-[11px] leading-relaxed text-muted">
            {t("nav.currencyNote")}
          </div>
        </div>
      ) : null}
    </div>
  );
}

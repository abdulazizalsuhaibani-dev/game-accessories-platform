import React from "react";
import { useStoreSettings } from "../../context/StoreSettings";

/**
 * The acid marquee above the nav. The four promises are repeated to fill twice
 * the viewport, and the track translates by half its width so the loop is seamless.
 */
export default function Ticker() {
  const { t } = useStoreSettings();
  const promises = [
    t("ticker.returns"),
    t("ticker.ships"),
    t("ticker.warranty"),
    t("ticker.priceMatch"),
  ];

  // Two identical halves; each half repeats the set enough times to overrun a
  // wide viewport before it wraps.
  const half = Array.from({ length: 4 }, () => promises).flat();

  return (
    <div className="flex h-7 items-center overflow-hidden whitespace-nowrap bg-acid">
      <div className="ticker-track flex gap-10 ps-6 font-mono text-[11px] font-semibold uppercase tracking-[.16em] text-void">
        {[...half, ...half].map((promise, index) => (
          <React.Fragment key={index}>
            <span>{promise}</span>
            <span aria-hidden="true">◆</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

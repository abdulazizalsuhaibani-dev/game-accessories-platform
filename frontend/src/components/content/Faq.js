import React from "react";
import { useStoreSettings } from "../../context/StoreSettings";

const ENTRY_COUNT = 7;

export default function Faq() {
  const { t } = useStoreSettings();
  const entries = Array.from({ length: ENTRY_COUNT }, (_, index) => index + 1);

  return (
    <div className="bg-chassis">
      <div className="border-b border-line px-6 py-4 sm:px-7">
        <h1 className="m-0 telemetry text-xs text-ink">{t("faq.title")}</h1>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-7">
        <div className="flex flex-col gap-px border border-line bg-line">
          {entries.map((n) => (
            <details key={n} className="group bg-panel p-4">
              <summary className="cursor-pointer list-none text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {t(`faq.q${n}`)}
                  <span aria-hidden="true" className="text-acid group-open:hidden">
                    +
                  </span>
                  <span aria-hidden="true" className="hidden text-acid group-open:inline">
                    −
                  </span>
                </span>
              </summary>
              <p className="m-0 mt-3 text-sm leading-relaxed text-dim">{t(`faq.a${n}`)}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

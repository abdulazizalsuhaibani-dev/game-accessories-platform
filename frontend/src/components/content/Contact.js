import React from "react";
import { useStoreSettings } from "../../context/StoreSettings";

export default function Contact() {
  const { t } = useStoreSettings();

  const rows = [
    { label: t("contact.emailLabel"), value: t("contact.email"), href: `mailto:${t("contact.email")}` },
    { label: t("contact.hoursLabel"), value: t("contact.hours") },
    { label: t("contact.locationLabel"), value: t("contact.location") },
  ];

  return (
    <div className="bg-chassis">
      <div className="border-b border-line px-6 py-4 sm:px-7">
        <h1 className="m-0 telemetry text-xs text-ink">{t("contact.title")}</h1>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-7">
        <p className="m-0 mb-8 text-[15px] leading-relaxed text-dim">{t("contact.intro")}</p>

        <dl className="m-0 grid gap-px border border-line bg-line sm:grid-cols-3">
          {rows.map((row) => (
            <div key={row.label} className="bg-panel p-4">
              <dt className="telemetry text-[10px] text-muted">{row.label}</dt>
              <dd className="m-0 mt-2.5 text-[15px] text-ink">
                {row.href ? (
                  <a href={row.href} className="text-acid hover:text-acid-hi">
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

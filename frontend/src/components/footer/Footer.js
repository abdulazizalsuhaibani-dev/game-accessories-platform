import React from "react";
import { Link } from "react-router-dom";
import Brand from "../shared/Brand";
import { useStoreSettings } from "../../context/StoreSettings";

export default function Footer() {
  const { t } = useStoreSettings();

  const columns = [
    {
      heading: t("footer.shop"),
      links: [
        { label: t("cat.mice"), to: "/products?search=mouse" },
        { label: t("cat.headsets"), to: "/products?search=headset" },
        { label: t("cat.controllers"), to: "/products?search=controller" },
      ],
    },
    {
      heading: t("footer.support"),
      links: [
        { label: t("footer.contact"), to: "/contact" },
        { label: t("footer.shipping"), to: "/shipping" },
        { label: t("footer.returns"), to: "/returns" },
        { label: t("footer.faq"), to: "/faq" },
      ],
    },
    {
      heading: t("footer.company"),
      links: [
        { label: t("footer.about"), to: "/about" },
        { label: t("footer.terms"), to: "/terms" },
        { label: t("footer.privacy"), to: "/privacy" },
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-void px-4 pb-24 pt-8 sm:px-11 lg:pb-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Brand to={null} size="sm" />
          <div className="mt-3 font-mono text-xs leading-relaxed text-muted">
            {t("footer.rights")}
            <br />
            {t("footer.reserved")}
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.heading}>
            <div className="mb-2.5 telemetry text-[10px] text-ink">{column.heading}</div>
            <ul className="space-y-1.5 text-xs text-dim">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-dim transition-colors hover:text-acid">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}

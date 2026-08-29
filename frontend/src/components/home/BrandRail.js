import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";

/**
 * The "start from a brand" block that closes the home page beside the signup panel.
 *
 * This used to live inside `newsletter/Newsletter.js` — the wrong file for it — and
 * listed four invented loadouts (`fps`, `mmo`, `console`, `streaming`) that linked to
 * a keyword search. None of them was a thing the store sold. `GET /Products/brands`
 * groups the catalogue by its `Brand` column, so a brand can only appear here if the
 * store actually stocks it, and each chip links to that brand and nothing else.
 */
export default function BrandRail() {
  const { t, num } = useStoreSettings();
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    let cancelled = false;

    axios
      .get(`${API_BASE}/Products/brands`)
      .then((response) => {
        if (cancelled) return;
        setBrands(Array.isArray(response.data) ? response.data : []);
      })
      // Better to show the panel's heading with no chips than to invent them again.
      .catch(() => {
        if (!cancelled) setBrands([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col justify-center gap-5 bg-panel px-6 py-11 sm:px-11">
      <div className="telemetry text-[11px] tracking-[.18em] text-acid">
        {t("guides.eyebrow")}
      </div>
      <h2 className="m-0 font-display text-[26px] font-bold uppercase leading-tight text-ink sm:text-[30px]">
        {t("guides.title")}
      </h2>

      {brands.length === 0 ? (
        <p className="m-0 text-[15px] text-dim">{t("guides.empty")}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <Link
              key={brand.brand}
              to={`/products?brand=${encodeURIComponent(brand.brand)}`}
              className="chip transition-colors hover:border-acid hover:text-acid"
            >
              {/* Brand names are proper nouns and are not translated — Razer is Razer
                  in both locales. Only the count follows the locale's digits. */}
              {brand.brand}
              <span className="ms-1.5 text-muted">{num(brand.productCount)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

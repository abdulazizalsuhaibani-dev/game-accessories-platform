import React from "react";
import { Link } from "react-router-dom";
import ImageWell from "../shared/ImageWell";
import HeroImage from "../images/hero.jpg";
import { useStoreSettings } from "../../context/StoreSettings";

export default function Hero({ stats }) {
  const { t, num } = useStoreSettings();

  // The only figure here that anything can vouch for. It used to sit beside a
  // hardcoded "24h" dispatch time with no data source at all, and an "average
  // rating" computed from the four products the home page happened to fetch.
  // Both had fallback constants, so they rendered a number even when the API
  // never answered. Nothing renders now until the count arrives.
  const itemCount = stats?.itemCount;

  return (
    <section className="grid border-b border-line lg:grid-cols-[1.05fr_.95fr]">
      <div className="flex flex-col gap-6 border-line bg-chassis px-6 py-12 sm:px-11 sm:py-16 lg:border-e">
        <h1 className="m-0 font-display text-[44px] font-bold uppercase leading-[.92] tracking-[-.015em] text-ink sm:text-[60px] lg:text-[76px]">
          {t("hero.titleA")}
          <br />
          <span className="text-acid">{t("hero.titleB")}</span>
        </h1>

        <p className="m-0 max-w-[40ch] text-base leading-relaxed text-dim">{t("hero.lede")}</p>

        <div className="mt-1 flex flex-wrap gap-3">
          <Link to="/products" className="h-[50px] btn-acid">
            {t("hero.ctaPrimary")}
          </Link>
        </div>

        {itemCount == null ? null : (
          <dl className="mt-5 flex flex-wrap gap-9 border-t border-line pt-6">
            <div>
              <dd className="m-0 font-display text-[26px] font-bold leading-none text-ink">
                {num(itemCount)}
              </dd>
              <dt className="mt-2 telemetry text-[10px] font-medium text-muted">
                {t("hero.statItems")}
              </dt>
            </div>
          </dl>
        )}
      </div>

      <ImageWell
        src={HeroImage}
        alt=""
        scanlines
        className="min-h-[280px] lg:min-h-[440px]"
        imageClassName="object-cover !p-0"
      />
    </section>
  );
}

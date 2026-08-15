import React from "react";
import { Link } from "react-router-dom";
import ImageWell from "../shared/ImageWell";
import HeroImage from "../images/hero.jpg";
import { useStoreSettings } from "../../context/StoreSettings";

export default function Hero({ stats }) {
  const { t, num } = useStoreSettings();

  const statTiles = [
    { value: num(stats?.itemCount ?? 412), label: t("hero.statItems") },
    { value: num("24h"), label: t("hero.statDispatch") },
    { value: num(stats?.avgRating ?? "4.7"), label: t("hero.statRating") },
  ];

  return (
    <section className="grid border-b border-line lg:grid-cols-[1.05fr_.95fr]">
      <div className="flex flex-col gap-6 border-line bg-chassis px-6 py-12 sm:px-11 sm:py-16 lg:border-e">
        <div className="flex items-center gap-2.5">
          <span className="h-[7px] w-[7px] flex-none bg-magenta" aria-hidden="true" />
          <span className="telemetry text-[11px] tracking-[.18em] text-magenta">
            {t("hero.eyebrow")}
          </span>
        </div>

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
          <Link to="/products?sort=1" className="h-[50px] whitespace-nowrap btn-ghost">
            {t("hero.ctaSecondary")}
          </Link>
        </div>

        <dl className="mt-5 flex flex-wrap gap-9 border-t border-line pt-6">
          {statTiles.map((stat) => (
            <div key={stat.label}>
              <dd className="m-0 font-display text-[26px] font-bold leading-none text-ink">
                {stat.value}
              </dd>
              <dt className="mt-2 telemetry text-[10px] font-medium text-muted">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>

      <ImageWell
        src={HeroImage}
        alt=""
        scanlines
        className="min-h-[280px] lg:min-h-[440px]"
        imageClassName="object-cover !p-0"
      >
        <div className="pointer-events-none absolute top-5 end-5 bg-magenta px-2.5 py-1.5 telemetry text-[10px] text-white">
          {t("hero.drop")}
        </div>
      </ImageWell>
    </section>
  );
}

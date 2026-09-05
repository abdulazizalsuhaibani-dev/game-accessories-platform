import React from "react";
import { Link } from "react-router-dom";
import ImageWell from "../shared/ImageWell";
import HeroImage from "../images/hero.jpg";
import { useStoreSettings } from "../../context/StoreSettings";

export default function Hero() {
  const { t } = useStoreSettings();

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

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useStoreSettings } from "../../context/StoreSettings";

/**
 * The split panel that closes the home page: a magenta signup block beside a
 * dark "start from a loadout" block.
 */
export default function Newsletter() {
  const { t } = useStoreSettings();
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const loadouts = [
    { key: "fps", query: "mouse" },
    { key: "mmo", query: "keyboard" },
    { key: "console", query: "controller" },
    { key: "streaming", query: "headset" },
  ];

  return (
    <section className="grid border-b border-line lg:grid-cols-2">
      <div className="flex flex-col justify-center gap-4 bg-magenta px-6 py-11 sm:px-11">
        <div className="telemetry text-[11px] tracking-[.18em] text-white/75">
          {t("news.eyebrow")}
        </div>
        <h2 className="m-0 font-display text-[28px] font-bold uppercase leading-tight text-white sm:text-[34px]">
          {t("news.title")}
        </h2>

        <form
          className="mt-2 flex"
          onSubmit={(event) => {
            event.preventDefault();
            if (email.trim()) setJoined(true);
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("news.placeholder")}
            aria-label={t("news.placeholder")}
            className="h-12 flex-1 border border-void bg-void px-3.5 text-sm text-ink outline-none placeholder:text-muted"
          />
          <button type="submit" className="h-12 shadow-none btn-acid">
            {t("news.join")}
          </button>
        </form>

        {joined ? (
          <p className="m-0 font-mono text-[11px] text-white" role="status">
            {t("news.thanks")}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col justify-center gap-5 bg-panel px-6 py-11 sm:px-11">
        <div className="telemetry text-[11px] tracking-[.18em] text-acid">{t("guides.eyebrow")}</div>
        <h2 className="m-0 font-display text-[26px] font-bold uppercase leading-tight text-ink sm:text-[30px]">
          {t("guides.title")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {loadouts.map((loadout) => (
            <Link
              key={loadout.key}
              to={`/products?search=${loadout.query}`}
              className="chip transition-colors hover:border-acid hover:text-acid"
            >
              {t(`guides.${loadout.key}`)}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

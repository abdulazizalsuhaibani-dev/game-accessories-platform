import React, { useState } from "react";
import axios from "axios";
import { API_BASE } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";
import BrandRail from "../home/BrandRail";

/**
 * The split panel that closes the home page: a magenta signup block beside the
 * brand rail. The rail's markup used to live in this file, which is not where
 * anyone would look for it — it is now `home/BrandRail.js`.
 *
 * The form used to be decorative: it checked the address was non-empty, set a
 * flag and threw the address away. It now creates a real store-wide sale
 * subscription, and the confirmation text says to check the inbox rather than
 * claiming the customer is already on the list — the API only adds them once
 * they click through, so saying so here would have been a lie.
 */
export default function Newsletter() {
  const { t, locale } = useStoreSettings();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | joined | error

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || status === "sending") return;

    setStatus("sending");
    axios
      .post(`${API_BASE}/Subscriptions`, {
        email: email.trim(),
        type: "Sales",
        // sent so the confirmation and every later announcement arrive in the
        // language the customer was reading when they signed up
        locale,
      })
      .then(() => {
        setStatus("joined");
        // clearing the field is what makes a second signup possible; the old
        // version latched on the first submit and never came back
        setEmail("");
      })
      .catch(() => setStatus("error"));
  }

  return (
    <section className="grid border-b border-line lg:grid-cols-2">
      <div className="flex flex-col justify-center gap-4 bg-magenta px-6 py-11 sm:px-11">
        <div className="telemetry text-[11px] tracking-[.18em] text-white/75">
          {t("news.eyebrow")}
        </div>
        <h2 className="m-0 font-display text-[28px] font-bold uppercase leading-tight text-white sm:text-[34px]">
          {t("news.title")}
        </h2>

        <form className="mt-2 flex" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              // typing again clears a stale result, so the panel is not still
              // showing "check your inbox" over a fresh address
              if (status === "joined" || status === "error") setStatus("idle");
            }}
            placeholder={t("news.placeholder")}
            aria-label={t("news.placeholder")}
            className="h-12 flex-1 border border-void bg-void px-3.5 text-sm text-ink outline-none placeholder:text-muted"
          />
          <button type="submit" disabled={status === "sending"} className="h-12 shadow-none btn-acid">
            {status === "sending" ? t("news.sending") : t("news.join")}
          </button>
        </form>

        {status === "joined" || status === "error" ? (
          <p className="m-0 font-mono text-[11px] text-white" role="status">
            {status === "joined" ? t("news.thanks") : t("news.error")}
          </p>
        ) : null}
      </div>

      <BrandRail />
    </section>
  );
}

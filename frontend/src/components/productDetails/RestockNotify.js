import React, { useState } from "react";
import axios from "axios";
import { API_BASE } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";

/**
 * "Tell me when this is back", on the out-of-stock product page.
 *
 * It lives here rather than on the grid card because the whole of
 * `products/Product.js` is a single <Link> — a form inside it would need every
 * click and keypress stopped from navigating, and a text input nested in an
 * anchor is a bad time for keyboard users regardless.
 *
 * The address is never checked against the customer list, and the API answers
 * the same way whatever the address is, so this cannot be used to find out who
 * has an account.
 */
export default function RestockNotify({ productId }) {
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
        type: "Restock",
        productId,
        locale,
      })
      .then(() => {
        setStatus("joined");
        setEmail("");
      })
      .catch(() => setStatus("error"));
  }

  return (
    <div className="flex flex-col gap-3 border border-line p-4">
      <div className="telemetry text-[11px] text-ink">{t("notify.restockTitle")}</div>
      <p className="m-0 text-[13px] leading-relaxed text-dim">{t("notify.restockBlurb")}</p>

      <form className="flex" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="restock-email">
          {t("news.placeholder")}
        </label>
        <input
          id="restock-email"
          type="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "joined" || status === "error") setStatus("idle");
          }}
          placeholder={t("news.placeholder")}
          className="field h-11 flex-1"
        />
        <button type="submit" disabled={status === "sending"} className="h-11 shadow-none btn-acid">
          {status === "sending" ? t("news.sending") : t("notify.submit")}
        </button>
      </form>

      {status === "joined" || status === "error" ? (
        <p
          className={`m-0 font-mono text-[11px] ${status === "joined" ? "text-acid" : "text-magenta"}`}
          role="status"
        >
          {status === "joined" ? t("news.thanks") : t("news.error")}
        </p>
      ) : null}
    </div>
  );
}

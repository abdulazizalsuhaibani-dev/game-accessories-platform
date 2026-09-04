import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../api";
import { useStoreSettings } from "../context/StoreSettings";

/**
 * Where the links in our emails land.
 *
 * Both actions are the same page with a different endpoint and different copy,
 * so they share one component rather than two near-identical files. The links
 * point at the storefront rather than straight at the API precisely so the
 * customer sees a real page in their own language — and it means the call goes
 * out from an origin already on the API's CORS allowlist.
 *
 * The request fires once. A mail client that prefetches the link, or a customer
 * who reloads, hits an endpoint that is idempotent on the server side, so
 * nothing here needs to guard against a second call beyond React's own effect.
 */
export default function SubscriptionActionPage({ action }) {
  const { t } = useStoreSettings();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("working"); // working | done | failed

  useEffect(() => {
    if (!token) {
      setStatus("failed");
      return;
    }
    let cancelled = false;
    axios
      .get(`${API_BASE}/Subscriptions/${action}`, { params: { token } })
      .then(() => {
        if (!cancelled) setStatus("done");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });
    return () => {
      cancelled = true;
    };
  }, [action, token]);

  const isConfirm = action === "confirm";

  let title = t("notify.working");
  let body = "";

  if (status === "done") {
    title = isConfirm ? t("notify.confirmTitle") : t("notify.unsubTitle");
    body = isConfirm ? t("notify.confirmBody") : t("notify.unsubBody");
  } else if (status === "failed") {
    // Only confirm can genuinely fail — unsubscribe answers 200 even for a token
    // it does not recognise, so reaching here means the request itself failed.
    title = isConfirm ? t("notify.confirmFailed") : t("news.error");
  }

  return (
    <div className="flex flex-col items-center gap-6 bg-chassis px-6 py-24 text-center">
      <h1 className="m-0 max-w-[36ch] font-display text-[28px] font-bold uppercase leading-tight text-ink">
        {title}
      </h1>
      {body ? <p className="m-0 max-w-[52ch] text-sm leading-relaxed text-dim">{body}</p> : null}
      <Link to="/products" className="h-[50px] btn-acid">
        {t("notify.backToShop")}
      </Link>
    </div>
  );
}

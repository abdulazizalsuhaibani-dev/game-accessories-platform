import React from "react";
import { useStoreSettings } from "../../context/StoreSettings";

/**
 * The 380px summary rail shared by the cart and the checkout.
 *
 * Only rows the store can actually stand behind are shown: the API prices are
 * tax-inclusive and the backend charges nothing for shipping, so there is no
 * separate tax or delivery line to add on top of the subtotal.
 */
export default function OrderSummary({ title, itemCount, subtotal, lines, children }) {
  const { t, num, price } = useStoreSettings();

  return (
    <aside className="flex flex-col gap-3.5 self-start bg-panel p-6">
      <h2 className="m-0 font-display text-lg font-bold uppercase tracking-[.04em] text-ink">
        {title}
      </h2>

      {lines?.length ? (
        <div className="flex flex-col gap-3 border-t border-line py-3.5">
          {lines.map((line) => (
            <div key={line.id} className="flex items-center gap-3">
              <div className="flex-1 text-[13px] font-medium leading-snug text-ink">
                {line.name}
                {line.quantity > 1 ? (
                  <span className="ms-1.5 font-mono text-[11px] text-muted">
                    ×{num(line.quantity)}
                  </span>
                ) : null}
              </div>
              <div className="font-mono text-xs text-dim">{price(line.total)}</div>
            </div>
          ))}
        </div>
      ) : null}

      <dl className="m-0 flex flex-col gap-2.5 border-y border-line py-3.5 text-[13px] text-dim">
        <div className="flex justify-between gap-3">
          <dt>{t("cart.subtotal", { count: itemCount })}</dt>
          <dd className="m-0 font-mono text-ink">{price(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>{t("cart.shipping")}</dt>
          <dd className="m-0 font-mono text-acid">{t("cart.free")}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>{t("cart.tax")}</dt>
          <dd className="m-0 font-mono text-muted">{t("cart.taxIncluded")}</dd>
        </div>
      </dl>

      <div className="flex items-baseline justify-between gap-3">
        <span className="telemetry text-[11px] text-dim">{t("cart.total")}</span>
        <span className="font-display text-[30px] font-bold leading-none text-acid">
          {price(subtotal)}
        </span>
      </div>

      {children}

      <p className="m-0 text-center font-mono text-[11px] leading-relaxed text-muted">
        {t("cart.secure")}
      </p>
    </aside>
  );
}

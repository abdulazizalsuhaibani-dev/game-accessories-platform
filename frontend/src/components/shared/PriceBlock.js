import React from "react";
import Money from "./Money";
import { useStoreSettings } from "../../context/StoreSettings";
import { isOnSale } from "../../utils/pricing";

/**
 * A product's price, with the original struck through beside it when the product
 * is on sale.
 *
 * Money takes a single amount and its colour comes from the parent span at each
 * call site, so widening it with a second amount would have meant every caller
 * passing two class names into one element. This composes two Money instances
 * instead and keeps Money as the one thing that knows about currency.
 *
 * With no sale it renders exactly what a bare <Money> rendered before, so the
 * swap is invisible on a full-price product.
 */
export default function PriceBlock({ product, className = "", strikeClassName = "" }) {
  const { t } = useStoreSettings();

  if (!isOnSale(product)) {
    return <Money amount={product.productPrice} className={className} />;
  }

  return (
    // items-baseline so the smaller struck price sits on the same line as the
    // sale price rather than centring against it
    <span className="inline-flex flex-wrap items-baseline gap-2">
      <Money amount={product.salePrice} className={className} />
      {/* The visually-hidden label is what stops a screen reader announcing two
          bare numbers with nothing to say which one is being charged. */}
      <span className="sr-only">{t("list.was")}</span>
      <s className={strikeClassName || "font-mono text-[13px] font-medium text-dim"}>
        <Money amount={product.productPrice} />
      </s>
    </span>
  );
}

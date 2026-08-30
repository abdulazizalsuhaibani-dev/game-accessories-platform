import React from "react";
import { Link } from "react-router-dom";
import ImageWell from "../shared/ImageWell";
import { useStoreSettings } from "../../context/StoreSettings";
import { productName } from "../../utils/productText";
import PriceBlock from "../shared/PriceBlock";
import { isOnSale } from "../../utils/pricing";

export default function Product({ product }) {
  const { t, num, locale } = useStoreSettings();
  // `sku === 0` missed a string "0", a null or an absent sku and called all three
  // in stock. Every other stock check in the app compares rather than identifies.
  const outOfStock = Number(product.sku) <= 0;
  const onSale = isOnSale(product);

  return (
    <Link
      to={`/products/${product.productId}`}
      className={`panel block transition-colors hover:border-acid ${
        outOfStock ? "hover:border-line" : ""
      }`}
    >
      {/* Being unavailable today is no reason to hide what the product looks like —
          a customer may still want to browse it or come back for it. The image is
          dimmed and badged instead of replaced by an empty well. */}
      <ImageWell
        src={product.productImage}
        alt={productName(product, locale)}
        className="h-[180px] border-b border-line"
        imageClassName={outOfStock ? "opacity-35 grayscale" : ""}
      >
        {outOfStock ? (
          <span className="pointer-events-none absolute top-3 start-3 status-pill bg-magenta text-white">
            {t("list.outOfStock")}
          </span>
        ) : null}
        {/* Opposite corner from the out-of-stock pill so the two can coexist, and
            `end` rather than `right` so it mirrors under RTL. */}
        {onSale ? (
          <span className="pointer-events-none absolute top-3 end-3 status-pill bg-acid text-chassis">
            {t("list.saleBadge", {
              percent: Math.round(
                (1 - product.salePrice / product.productPrice) * 100
              ),
            })}
          </span>
        ) : null}
      </ImageWell>

      <div className="p-4">
        <div className="telemetry text-[10px] font-medium text-muted">
          {product.productColor || " "}
        </div>
        <div className="mt-2 text-[15px] font-semibold leading-snug text-ink">
          {productName(product, locale)}
        </div>

        <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3.5">
          <PriceBlock
            product={product}
            className={`font-display text-[19px] font-bold ${
              outOfStock ? "text-dim" : "text-acid"
            }`}
          />
          <span className="font-mono text-[11px] font-medium text-dim">
            {num(Number(product.averageRating || 0).toFixed(1))}★
          </span>
        </div>
      </div>
    </Link>
  );
}

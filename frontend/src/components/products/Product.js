import React from "react";
import { Link } from "react-router-dom";
import ImageWell from "../shared/ImageWell";
import { useStoreSettings } from "../../context/StoreSettings";

export default function Product({ product }) {
  const { t, num, price } = useStoreSettings();
  const outOfStock = product.sku === 0;

  return (
    <Link
      to={`/products/${product.productId}`}
      className={`panel block transition-colors hover:border-acid ${
        outOfStock ? "opacity-60 hover:border-line" : ""
      }`}
    >
      {outOfStock ? (
        <div className="flex h-[180px] items-center justify-center border-b border-line bg-well">
          <span className="border border-edge px-3 py-1.5 telemetry text-[10px] text-dim">
            {t("list.outOfStock")}
          </span>
        </div>
      ) : (
        <ImageWell
          src={product.productImage}
          alt={product.productName}
          className="h-[180px] border-b border-line"
        />
      )}

      <div className="p-4">
        <div className="telemetry text-[10px] font-medium text-muted">
          {product.productColor || " "}
        </div>
        <div className="mt-2 text-[15px] font-semibold leading-snug text-ink">
          {product.productName}
        </div>
        {product.weight ? (
          <div className="mt-2 font-mono text-xs text-muted">{num(product.weight)}g</div>
        ) : null}

        <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3.5">
          <span
            className={`font-display text-[19px] font-bold ${
              outOfStock ? "text-dim" : "text-acid"
            }`}
          >
            {price(product.productPrice)}
          </span>
          <span className="font-mono text-[11px] font-medium text-dim">
            {num(Number(product.averageRating || 0).toFixed(1))}★
          </span>
        </div>
      </div>
    </Link>
  );
}

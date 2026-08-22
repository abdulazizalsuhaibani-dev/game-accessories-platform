import React from "react";
import { Link } from "react-router-dom";
import ImageWell from "../shared/ImageWell";
import { useStoreSettings } from "../../context/StoreSettings";
import Money from "../shared/Money";

/** Top four products, ranked — the numbered corner tab marks first place acid. */
export default function Leaderboard({ products, loading }) {
  const { t, num } = useStoreSettings();

  return (
    <section className="border-b border-line px-6 py-10 sm:px-11">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="m-0 font-display text-2xl font-bold uppercase text-ink">{t("best.title")}</h2>
        <Link to="/products" className="telemetry text-[11px] tracking-badge">
          {t("best.seeAll")} <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="panel h-[320px] animate-pulse" />
            ))
          : products.map((product, index) => (
              <Link
                key={product.productId}
                to={`/products/${product.productId}`}
                className="panel relative transition-colors hover:border-acid"
              >
                <span
                  className={`absolute top-0 start-0 z-10 px-2.5 py-1.5 font-mono text-[10px] font-semibold tracking-badge ${
                    index === 0 ? "bg-acid text-void" : "bg-line text-ink"
                  }`}
                >
                  {num(String(index + 1).padStart(2, "0"))}
                </span>

                <ImageWell
                  src={product.productImage}
                  alt={product.productName}
                  className="h-[168px] border-b border-line"
                />

                <div className="p-4">
                  <div className="telemetry text-[10px] font-medium text-muted">
                    {product.productColor || t("cat.mice")}
                  </div>
                  <div className="mt-2 min-h-[40px] text-[15px] font-semibold leading-snug text-ink">
                    {product.productName}
                  </div>
                  <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3.5">
                    <span className="font-display text-[19px] font-bold text-acid">
                      <Money amount={product.productPrice} />
                    </span>
                    <span className="font-mono text-[11px] font-medium text-dim">
                      {num(Number(product.averageRating || 0).toFixed(1))}★
                    </span>
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}

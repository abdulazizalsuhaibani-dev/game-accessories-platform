import React from "react";
import { Link } from "react-router-dom";
import { LinearProgress } from "@mui/material";
import Error from "../error/Error";
import ProductDetailsCard from "./ProductDetailsCard";
import { useStoreSettings } from "../../context/StoreSettings";

export default function ProductDetails(prop) {
  const { product, loading, error, ...rest } = prop;
  const { t } = useStoreSettings();

  if (loading) {
    return (
      <div className="bg-chassis py-20">
        <LinearProgress />
      </div>
    );
  }

  if (error || !product) {
    return <Error errorMessage={t("detail.loadError")} errorCode={404} />;
  }

  return (
    <div className="bg-chassis">
      <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 sm:px-7">
        <div className="telemetry text-[11px] font-medium tracking-badge text-muted">
          <Link to="/products" className="text-muted hover:text-acid">
            {t("nav.shop")}
          </Link>{" "}
          / {product.productName}
        </div>
        <Link to="/products" className="telemetry text-[11px] tracking-badge">
          <span aria-hidden="true">←</span> {t("cart.keepShopping")}
        </Link>
      </div>

      <ProductDetailsCard product={product} {...rest} />
    </div>
  );
}

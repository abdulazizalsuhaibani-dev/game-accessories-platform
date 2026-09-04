import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import CartItem from "./CartItem";
import OrderSummary from "./OrderSummary";
import ImageWell from "../shared/ImageWell";
import { API_BASE } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";
import { productName } from "../../utils/productText";
import { cartSubtotal, cartItemCount } from "../../utils/cart";
import PriceBlock from "../shared/PriceBlock";

export default function Cart(prop) {
  const {
    cart,
    setCart,
    userData,
    setSnackBarMessage,
    setOpenErrorSnackBar,
  } = prop;
  const { t, locale } = useStoreSettings();
  const navigate = useNavigate();
  const [upsell, setUpsell] = useState([]);

  // "Complete the loadout" pulls real catalogue items rather than inventing
  // accessories, skipping anything already in the cart.
  useEffect(() => {
    if (cart.length === 0) return undefined;
    let cancelled = false;
    axios
      .get(`${API_BASE}/Products?Limit=6&Offset=0`)
      .then((response) => {
        if (cancelled) return;
        const inCart = new Set(cart.map((line) => line.product.productId));
        setUpsell((response.data.products ?? []).filter((p) => !inCart.has(p.productId)).slice(0, 3));
      })
      .catch(() => {
        // The upsell strip is optional; a failure just hides it.
      });
    return () => {
      cancelled = true;
    };
  }, [cart]);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 bg-chassis px-6 py-24">
        <p className="m-0 font-display text-2xl font-bold uppercase text-ink">{t("cart.empty")}</p>
        <Link to="/products" className="h-[50px] btn-acid">
          {t("cart.keepShopping")}
        </Link>
      </div>
    );
  }

  const subtotal = cartSubtotal(cart);

  return (
    <div className="bg-chassis">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-4 sm:px-7">
        <h1 className="m-0 telemetry text-xs text-ink">{t("cart.title")}</h1>
        <Link to="/products" className="telemetry text-[11px] tracking-badge">
          <span aria-hidden="true">←</span> {t("cart.keepShopping")}
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px]">
        <div className="border-line lg:border-e">
          {cart.map((cartItem) => (
            <CartItem
              key={cartItem.product.productId}
              cartItem={cartItem}
              cart={cart}
              setCart={setCart}
              setSnackBarMessage={setSnackBarMessage}
              setOpenErrorSnackBar={setOpenErrorSnackBar}
            />
          ))}

          {upsell.length ? (
            <div className="px-6 pb-8 pt-6 sm:px-7">
              <div className="mb-4 telemetry text-[11px] text-dim">{t("cart.loadout")}</div>
              <div className="grid gap-3.5 sm:grid-cols-3">
                {upsell.map((product) => (
                  <Link
                    key={product.productId}
                    to={`/products/${product.productId}`}
                    className="panel flex items-center gap-3 p-3.5 transition-colors hover:border-acid"
                  >
                    <ImageWell
                      src={product.productImage}
                      alt=""
                      className="h-12 w-12 flex-none"
                      imageClassName="!p-1"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium leading-snug text-ink">
                        {productName(product, locale)}
                      </div>
                      <div className="mt-1.5">
                        <PriceBlock
                          product={product}
                          className="font-display text-sm font-bold text-acid"
                          strikeClassName="font-mono text-[11px] font-medium text-dim"
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <OrderSummary
          title={t("cart.summary")}
          itemCount={cartItemCount(cart)}
          subtotal={subtotal}
        >
          <button
            type="button"
            onClick={() => navigate(userData ? "/checkout" : "/login")}
            className="h-[52px] btn-acid"
          >
            {t("cart.checkout")} <span aria-hidden="true">→</span>
          </button>
        </OrderSummary>
      </div>
    </div>
  );
}

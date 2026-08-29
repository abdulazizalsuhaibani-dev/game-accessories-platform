import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageWell from "../shared/ImageWell";
import Reviews from "./Reviews";
import ReviewForm from "../forms/ReviewForm";
import { useStoreSettings } from "../../context/StoreSettings";
import { productName, productDescription } from "../../utils/productText";
import Money from "../shared/Money";

const TABS = ["specs", "reviews", "shipping"];

export default function ProductDetailsCard(prop) {
  const {
    product,
    wishList,
    setWishList,
    setWishListCount,
    cart,
    setCart,
    setCartCount,
    userData,
    isAuthenticated,
    setSnackBarMessage,
    setOpenSuccessSnackBar,
    setOpenErrorSnackBar,
  } = prop;
  const { t, num, locale } = useStoreSettings();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState("specs");

  const inStock = product.sku > 0;
  const saved = wishList.some((item) => item.productId === product.productId);

  function handleAddToWishList() {
    if (saved) return;
    const updated = [...wishList, product];
    localStorage.setItem("wishList", JSON.stringify(updated));
    setWishList(updated);
    setWishListCount(updated.length);
    setSnackBarMessage(t("detail.addedToWishlist"));
    setOpenSuccessSnackBar(true);
  }

  function buildCartLine(count) {
    return {
      product,
      productId: product.productId,
      quantity: count,
      sku: product.sku,
    };
  }

  function handleAddToCart() {
    const existing = cart.find((item) => item.product.productId === product.productId);
    const updatedCart = existing
      ? cart.map((item) =>
          item.product.productId === product.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      : [...cart, buildCartLine(quantity)];

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
    setCartCount(updatedCart.length);
    setSnackBarMessage(t("detail.addedToCart"));
    setOpenSuccessSnackBar(true);
  }

  function handleBuyNow() {
    const line = [buildCartLine(quantity)];
    localStorage.setItem("cart", JSON.stringify(line));
    setCart(line);
    setCartCount(line.length);
    navigate("/checkout");
  }

  const specTiles = [
    { value: num(product.sku ?? 0), label: t("detail.sku") },
    {
      value: num(Number(product.averageRating || 0).toFixed(1)),
      label: t("detail.rating"),
    },
  ];

  return (
    <div className="grid border-b border-line lg:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col gap-3 border-line p-7 lg:border-e">
        {/* Capped rather than stretched: catalogue titles vary wildly in
            length, and letting the well match the info column would blow the
            product photo up to full-page height. */}
        <ImageWell
          src={product.productImage}
          alt={productName(product, locale)}
          scanlines
          className="h-[340px] lg:h-[460px]"
        />
        {/* The catalogue exposes a single image per product; the strip below
            renders only when a product carries more than one. */}
        {Array.isArray(product.images) && product.images.length > 1 ? (
          <div className="grid grid-cols-4 gap-3">
            {product.images.slice(0, 4).map((image, index) => (
              <ImageWell
                key={image}
                src={image}
                alt=""
                className={`h-[84px] border ${index === 0 ? "border-acid" : "border-line"}`}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-5 p-6 pb-9 sm:p-8">
        <div className="flex flex-wrap items-center gap-2.5">
          {product.sku > 0 && product.sku <= 10 ? (
            <span className="bg-magenta px-2.5 py-1.5 font-mono text-[10px] font-semibold tracking-badge text-white">
              {t("admin.lowStock")}
            </span>
          ) : null}
          <span className="telemetry text-[11px] font-medium text-dim">
            {product.subCategoryName || t("list.title")}
          </span>
        </div>

        <h1 className="m-0 font-display text-[32px] font-bold uppercase leading-tight text-ink sm:text-[42px]">
          {productName(product, locale)}
        </h1>

        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-display text-[34px] font-bold leading-none text-acid">
            <Money amount={product.productPrice} />
          </span>
          <span className="ms-auto font-mono text-xs font-medium text-dim">
            {num(Number(product.averageRating || 0).toFixed(1))}★
          </span>
        </div>

        <div className="grid grid-cols-2 gap-px border border-line bg-line">
          {specTiles.map((tile) => (
            <div key={tile.label} className="bg-panel p-3.5">
              <div className="font-display text-xl font-bold leading-none text-ink">
                {tile.value}
              </div>
              <div className="mt-2 telemetry text-[10px] font-medium text-muted">{tile.label}</div>
            </div>
          ))}
        </div>

        {product.productColor ? (
          <div>
            <div className="mb-2.5 telemetry text-[11px] text-dim">{t("detail.colour")}</div>
            <span
              className="block h-9 w-9 border border-acid"
              style={{ background: product.productColor }}
              title={product.productColor}
            />
          </div>
        ) : null}

        {inStock ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-[52px] border border-line">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 text-dim transition-colors hover:text-acid"
                >
                  −
                </button>
                <span className="flex w-12 items-center justify-center border-x border-line font-mono text-[15px] font-semibold text-ink">
                  {num(quantity)}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.min(product.sku, current + 1))}
                  aria-label="Increase quantity"
                  className="w-11 text-dim transition-colors hover:text-acid"
                >
                  +
                </button>
              </div>

              <button type="button" onClick={handleAddToCart} className="h-[52px] flex-1 btn-acid">
                {t("detail.addToCart")}
              </button>

              <button
                type="button"
                onClick={handleAddToWishList}
                aria-label={t("nav.wishlist")}
                aria-pressed={saved}
                className={`h-[52px] w-[52px] border text-base transition-colors ${
                  saved ? "border-acid text-acid" : "border-edge text-ink hover:border-acid"
                }`}
              >
                ♥
              </button>
            </div>

            <button type="button" onClick={handleBuyNow} className="h-[50px] btn-ghost">
              {t("detail.buyNow")}
            </button>

            <div className="flex items-center gap-2.5 telemetry text-[11px] font-medium text-acid">
              <span className="h-[7px] w-[7px] flex-none bg-acid" aria-hidden="true" />
              {product.sku <= 10
                ? t("detail.stockLeft", { count: product.sku })
                : t("detail.inStock")}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2.5 border border-magenta p-4 telemetry text-[11px] text-magenta">
            <span className="h-[7px] w-[7px] flex-none bg-magenta" aria-hidden="true" />
            {t("detail.outOfStock")}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-line pt-5">
          <div className="flex gap-6" role="tablist">
            {TABS.map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={tab === name}
                onClick={() => setTab(name)}
                className={`pb-2 telemetry text-[11px] tracking-badge transition-colors ${
                  tab === name
                    ? "border-b-2 border-acid text-ink"
                    : "border-b-2 border-transparent text-muted hover:text-dim"
                }`}
              >
                {t(`detail.${name}`)}
              </button>
            ))}
          </div>

          <div role="tabpanel">
            {tab === "specs" ? (
              <p className="m-0 text-sm leading-relaxed text-dim">
                {productDescription(product, locale) || "—"}
              </p>
            ) : null}

            {tab === "shipping" ? (
              <p className="m-0 text-sm leading-relaxed text-dim">{t("detail.shippingCopy")}</p>
            ) : null}

            {tab === "reviews" ? (
              <div className="flex flex-col gap-5">
                {isAuthenticated ? (
                  <ReviewForm
                    userId={userData.userId}
                    productId={product.productId}
                    setSnackBarMessage={setSnackBarMessage}
                    setOpenSuccessSnackBar={setOpenSuccessSnackBar}
                    setOpenErrorSnackBar={setOpenErrorSnackBar}
                  />
                ) : (
                  <p className="m-0 font-mono text-xs text-muted">{t("detail.mustLogin")}</p>
                )}
                <Reviews
                  productId={product.productId}
                  setSnackBarMessage={setSnackBarMessage}
                  setOpenErrorSnackBar={setOpenErrorSnackBar}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

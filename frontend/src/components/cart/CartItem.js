import React from "react";
import { Link } from "react-router-dom";
import ImageWell from "../shared/ImageWell";
import { useStoreSettings } from "../../context/StoreSettings";
import { productName } from "../../utils/productText";
import Money from "../shared/Money";

export default function CartItem(prop) {
  const { cartItem, cart, setCart, setCartCount, setSnackBarMessage, setOpenErrorSnackBar } = prop;
  const { t, num, locale } = useStoreSettings();

  function writeCart(updatedCart) {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
    setCartCount(updatedCart.length);
  }

  function setQuantity(next) {
    writeCart(
      cart.map((item) =>
        item.product.productId === cartItem.product.productId
          ? { ...item, quantity: next }
          : item
      )
    );
  }

  function handleIncrement() {
    if (cartItem.quantity >= cartItem.product.sku) {
      setSnackBarMessage("Cannot increase the quantity, SKU is out of stock!");
      setOpenErrorSnackBar(true);
      return;
    }
    setQuantity(cartItem.quantity + 1);
  }

  function handleDecrement() {
    if (cartItem.quantity > 1) {
      setQuantity(cartItem.quantity - 1);
      return;
    }
    handleRemove();
  }

  function handleRemove() {
    writeCart(
      cart.filter((item) => item.product.productId !== cartItem.product.productId)
    );
  }

  const inStock = cartItem.product.sku > 0;

  return (
    <div className="flex flex-wrap gap-5 border-b border-line px-6 py-6 sm:px-7">
      <ImageWell
        src={cartItem.product.productImage}
        alt={productName(cartItem.product, locale)}
        className="h-[110px] w-[110px] flex-none"
      />

      <div className="flex min-w-[200px] flex-1 flex-col gap-2">
        {cartItem.product.productColor ? (
          <div className="telemetry text-[10px] font-medium text-muted">
            {cartItem.product.productColor}
          </div>
        ) : null}

        <Link
          to={`/products/${cartItem.productId}`}
          className="text-[17px] font-semibold leading-snug text-ink hover:text-acid"
        >
          {productName(cartItem.product, locale)}
        </Link>

        <div className={`font-mono text-xs ${inStock ? "text-acid" : "text-magenta"}`}>
          {inStock ? t("cart.shipsToday") : t("detail.outOfStock")}
        </div>

        <div className="mt-1.5 flex gap-4">
          <button
            type="button"
            onClick={handleRemove}
            className="telemetry text-[10px] tracking-badge text-magenta hover:text-white"
          >
            {t("cart.remove")}
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <div className="font-display text-xl font-bold text-ink">
          <Money amount={cartItem.product.productPrice * cartItem.quantity} />
        </div>
        <div className="flex h-9 border border-line">
          <button
            type="button"
            onClick={handleDecrement}
            aria-label="Decrease quantity"
            className="w-8 text-dim transition-colors hover:text-acid"
          >
            −
          </button>
          <span className="flex w-9 items-center justify-center border-x border-line font-mono text-[13px] font-semibold text-ink">
            {num(cartItem.quantity)}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            aria-label="Increase quantity"
            className="w-8 text-dim transition-colors hover:text-acid"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

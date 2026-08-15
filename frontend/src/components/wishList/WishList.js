import React from "react";
import { Link } from "react-router-dom";
import WishListItem from "./WishListItem";
import { useStoreSettings } from "../../context/StoreSettings";

export default function WishList({ wishList, setWishList, setWishListCount }) {
  const { t } = useStoreSettings();

  function handleRemove(productId) {
    const updated = wishList.filter((item) => item.productId !== productId);
    localStorage.setItem("wishList", JSON.stringify(updated));
    setWishList(updated);
    setWishListCount(updated.length);
  }

  if (!wishList || wishList.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 bg-chassis px-6 py-24">
        <p className="m-0 font-display text-2xl font-bold uppercase text-ink">
          {t("wishlist.empty")}
        </p>
        <Link to="/products" className="h-[50px] btn-acid">
          {t("cart.keepShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-chassis">
      <div className="border-b border-line px-6 py-4 sm:px-7">
        <h1 className="m-0 telemetry text-xs text-ink">{t("wishlist.title")}</h1>
      </div>

      <div className="grid gap-4 px-6 py-7 sm:grid-cols-2 sm:px-7 lg:grid-cols-4">
        {wishList.map((wishListItem) => (
          <WishListItem
            key={wishListItem.productId}
            wishListItem={wishListItem}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  );
}

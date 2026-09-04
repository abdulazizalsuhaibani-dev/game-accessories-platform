import React from "react";
import { Link } from "react-router-dom";
import ImageWell from "../shared/ImageWell";
import { useStoreSettings } from "../../context/StoreSettings";
import { productName } from "../../utils/productText";
import PriceBlock from "../shared/PriceBlock";

export default function WishListItem({ wishListItem, onRemove }) {
  const { t, locale } = useStoreSettings();

  return (
    <div className="panel relative transition-colors hover:border-acid">
      <button
        type="button"
        onClick={() => onRemove(wishListItem.productId)}
        className="absolute top-0 end-0 z-10 bg-line px-2.5 py-1.5 telemetry text-[10px] text-dim transition-colors hover:bg-magenta hover:text-white"
      >
        {t("cart.remove")}
      </button>

      <Link to={`/products/${wishListItem.productId}`} className="block">
        <ImageWell
          src={wishListItem.productImage}
          alt={productName(wishListItem, locale)}
          className="h-[180px] border-b border-line"
        />
        <div className="p-4">
          <div className="text-[15px] font-semibold leading-snug text-ink">
            {productName(wishListItem, locale)}
          </div>
          <div className="mt-3.5 border-t border-line pt-3.5">
            {/* the wishlist stores the whole product object, so the saved row is
                the product PriceBlock expects. Rows saved before sales existed
                carry no salePrice and fall back to the list price. */}
            <PriceBlock
              product={wishListItem}
              className="font-display text-[19px] font-bold text-acid"
            />
          </div>
        </div>
      </Link>
    </div>
  );
}

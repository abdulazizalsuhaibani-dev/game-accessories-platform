import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ProductDetails from "../components/productDetails/ProductDetails";
import { formatTitle } from "../components/shared/DocumentTitle";
import { API_BASE } from "../api";
import { useStoreSettings } from "../context/StoreSettings";
import { productName } from "../utils/productText";

export default function ProductDetailsPage(prop) {
  const {
    wishList,
    setWishList,
    setWishListCount,
    cart,
    setCart,
    userData,
    isAuthenticated,
    setSnackBarMessage,
    setOpenSuccessSnackBar,
    setOpenErrorSnackBar,
  } = prop;
  const params = useParams();
  const { t, locale } = useStoreSettings();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // DocumentTitle deliberately skips this route, because the tab label is the
  // product name and that is only known once the fetch resolves.
  useEffect(() => {
    if (loading) return;
    document.title = formatTitle(
      product ? productName(product, locale) : t("error.pageTitle")
    );
  }, [loading, product, t, locale]);

  const productUrl = `${API_BASE}/Products/${params.productId}`;
  useEffect(() => {
    function getSingleProduct() {
      axios
        .get(productUrl)
        .then((response) => {
          if (response.data === "") {
            setError(response);
            setLoading(false);
          } else {
            setProduct(response.data);
            setLoading(false);
          }
        })
        .catch((response) => {
          setError(response);
          setLoading(false);
        });
    }
    getSingleProduct();
  }, [productUrl]);

  return (
    <div>
      <ProductDetails
        product={product}
        loading={loading}
        error={error}
        wishList={wishList}
        setWishList={setWishList}
        setWishListCount={setWishListCount}
        cart={cart}
        setCart={setCart}
        userData={userData}
        isAuthenticated={isAuthenticated}
        setSnackBarMessage={setSnackBarMessage}
        setOpenSuccessSnackBar={setOpenSuccessSnackBar}
        setOpenErrorSnackBar={setOpenErrorSnackBar}
      />
    </div>
  );
}

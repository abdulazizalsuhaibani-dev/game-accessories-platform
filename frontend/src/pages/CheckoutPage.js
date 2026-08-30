import React from "react";
import Checkout from "../components/checkout/Checkout";

export default function CheckoutPage(prop) {
  const {
    userData,
    setSnackBarMessage,
    setOpenSuccessSnackBar,
    setOpenErrorSnackBar,
    cart,
    setCart,
  } = prop;

  return (
    <Checkout
      userData={userData}
      setSnackBarMessage={setSnackBarMessage}
      setOpenSuccessSnackBar={setOpenSuccessSnackBar}
      setOpenErrorSnackBar={setOpenErrorSnackBar}
      cart={cart}
      setCart={setCart}
    />
  );
}

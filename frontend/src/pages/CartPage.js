import React from "react";
import Cart from "../components/cart/Cart";

export default function CartPage(prop) {
  const {
    cart,
    setCart,
    userData,
    setSnackBarMessage,
    setOpenSuccessSnackBar,
    setOpenErrorSnackBar,
  } = prop;

  return (
    <div>
      <Cart
        cart={cart}
        setCart={setCart}
        userData={userData}
        setSnackBarMessage={setSnackBarMessage}
        setOpenSuccessSnackBar={setOpenSuccessSnackBar}
        setOpenErrorSnackBar={setOpenErrorSnackBar}
      />
    </div>
  );
}

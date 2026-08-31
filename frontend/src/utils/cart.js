// Cart arithmetic, in one place. These used to live in components/cart/Cart.js,
// which meant App.js — the component that actually owns the cart — could not
// reach them without importing the whole cart screen. The header badge grew its
// own definition instead (updatedCart.length, the number of distinct lines) and
// drifted from the summary's (the sum of quantities), so adding three of one
// product showed 1 in the header and 3 in the cart.
//
// A cart line is { product, productId, quantity, sku }; every line carries a
// quantity, so both figures are derivable from the array and neither needs to be
// tracked as separate state.

export function cartSubtotal(cart) {
  return cart.reduce((sum, line) => sum + line.product.productPrice * line.quantity, 0);
}

export function cartItemCount(cart) {
  return cart.reduce((sum, line) => sum + line.quantity, 0);
}

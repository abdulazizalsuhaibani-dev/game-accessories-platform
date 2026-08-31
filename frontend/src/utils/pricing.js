// The API decides what a product costs. It sends productPrice - always the list
// price - and salePrice, which is null unless a sale is actually running. The
// percentage and the sale window are sent too, but only so the badge can say
// "-20%"; the storefront never derives a price from them, because a client whose
// clock is wrong would then advertise a price the server will not honour.
//
// The nullish fallback matters beyond a missing sale: carts already sitting in a
// shopper's localStorage hold product objects saved before salePrice existed.

export function effectivePrice(product) {
  if (!product) return 0;
  return product.salePrice ?? product.productPrice;
}

export function isOnSale(product) {
  if (!product) return false;
  const sale = product.salePrice;
  return typeof sale === "number" && sale < product.productPrice;
}

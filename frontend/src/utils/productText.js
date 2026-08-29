// Product names and descriptions are catalogue data, not UI copy, so they cannot
// live in i18n/strings.js — the entity carries a second set of columns instead.
// Both are nullable and a half-translated catalogue is the expected state, so an
// untranslated product falls back to its English text rather than rendering blank.
//
// One helper rather than a locale check at each call site: product names are shown
// on the listing, the leaderboard, the details page, the cart, checkout and the
// wishlist, and a check missed in one of those is a product that silently stays
// English on an otherwise Arabic page.

function pick(english, arabic, locale) {
  const translated = (arabic || "").trim();
  if (locale === "ar" && translated) return translated;
  return english || "";
}

export function productName(product, locale) {
  if (!product) return "";
  return pick(product.productName, product.nameAr, locale);
}

export function productDescription(product, locale) {
  if (!product) return "";
  return pick(product.description, product.descriptionAr, locale);
}

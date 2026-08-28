// The API names categories in English only — "Gaming Mouses", "Gaming Chairs" —
// so the Arabic label has to be matched by name here. Only presentation lives in
// this map: which categories exist, how many products each holds and what they
// look like all come from the API. A category the store has no word for still
// renders, under whatever name the API gave it.
const LABEL_KEYS = {
  mice: "cat.mice",
  mouses: "cat.mice",
  headsets: "cat.headsets",
  controllers: "cat.controllers",
  keyboards: "cat.keyboards",
  monitors: "cat.monitors",
  chairs: "cat.chairs",
};

// "Gaming Mouses" and "Mice" are the same shelf as far as the storefront cares.
export function categoryKey(categoryName) {
  return (categoryName || "").toLowerCase().replace(/^gaming\s+/, "").trim();
}

export function categoryLabel(t, categoryName) {
  const key = LABEL_KEYS[categoryKey(categoryName)];
  return key ? t(key) : categoryName || "";
}

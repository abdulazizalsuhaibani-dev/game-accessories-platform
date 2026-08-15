// Catalogue prices come off the API in USD, so every rate here is per 1 USD.
// The Gulf currencies are pegged, so those rates are exact and stable; EUR and
// GBP float and are indicative only — the design's own footnote says prices
// convert at checkout.
export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", nameAr: "دولار أمريكي", rate: 1, decimals: 2 },
  { code: "EUR", symbol: "€", name: "Euro", nameAr: "يورو", rate: 0.92, decimals: 2 },
  { code: "GBP", symbol: "£", name: "Pound Sterling", nameAr: "جنيه إسترليني", rate: 0.79, decimals: 2 },
  { code: "SAR", symbol: "ر.س", name: "Saudi Riyal", nameAr: "ريال سعودي", rate: 3.75, decimals: 2, gulf: true },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", nameAr: "درهم إماراتي", rate: 3.6725, decimals: 2, gulf: true },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", nameAr: "دينار كويتي", rate: 0.307, decimals: 3, gulf: true },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal", nameAr: "ريال قطري", rate: 3.64, decimals: 2, gulf: true },
  { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar", nameAr: "دينار بحريني", rate: 0.376, decimals: 3, gulf: true },
  { code: "OMR", symbol: "ر.ع", name: "Omani Rial", nameAr: "ريال عماني", rate: 0.3845, decimals: 3, gulf: true },
];

export const DEFAULT_CURRENCY = "USD";

export function getCurrency(code) {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Arabic screens use Eastern Arabic numerals and the ٫ decimal separator. */
export function localizeDigits(text, locale) {
  if (locale !== "ar") return text;
  return String(text)
    .replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)])
    .replace(/\./g, "٫")
    .replace(/,/g, "٬");
}

/**
 * Convert a USD amount and render it the way the design does: symbol leading
 * for the Latin symbols ($135.99), trailing for the Arabic-script Gulf ones and
 * for Arabic throughout (٥٠٩٫٩٦ ر.س). A leading "ر.س" would break the reading
 * order of an otherwise left-to-right line.
 */
export function formatMoney(usdAmount, currencyCode, locale = "en") {
  const currency = getCurrency(currencyCode);
  const value = Number(usdAmount || 0) * currency.rate;
  const fixed = value.toLocaleString("en-US", {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  });
  const digits = localizeDigits(fixed, locale);
  const trailing = locale === "ar" || currency.gulf;
  return trailing ? `${digits} ${currency.symbol}` : `${currency.symbol}${digits}`;
}

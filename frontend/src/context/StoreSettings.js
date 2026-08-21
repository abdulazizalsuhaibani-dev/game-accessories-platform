import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import strings from "../i18n/strings";
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  formatMoney,
  getCurrency,
  localizeDigits,
} from "../i18n/currencies";

const LOCALE_KEY = "locale";
const CURRENCY_KEY = "currency";

// Derived, never hand-listed: a returning customer can have any past choice in
// localStorage, and this is what decides whether it is still offered. A literal
// copy of the currency list drifts the moment one is added or removed.
const CURRENCY_CODES = CURRENCIES.map((currency) => currency.code);

const StoreSettingsContext = createContext(null);

function readStored(key, fallback, allowed) {
  const stored = localStorage.getItem(key);
  return stored && allowed.includes(stored) ? stored : fallback;
}

export function StoreSettingsProvider({ children }) {
  const [locale, setLocaleState] = useState(() => readStored(LOCALE_KEY, "en", ["en", "ar"]));
  const [currency, setCurrencyState] = useState(() =>
    readStored(CURRENCY_KEY, DEFAULT_CURRENCY, CURRENCY_CODES)
  );

  // Direction lives on <html> so MUI portals (dialogs, popovers, snackbars)
  // mirror along with the rest of the page.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((next) => {
    localStorage.setItem(LOCALE_KEY, next);
    setLocaleState(next);
  }, []);

  const setCurrency = useCallback((next) => {
    localStorage.setItem(CURRENCY_KEY, next);
    setCurrencyState(next);
  }, []);

  /**
   * Look up a string and interpolate {placeholders}. Numeric values are
   * localized on the way in, so "{count} results" becomes "٤٨ نتيجة".
   */
  const t = useCallback(
    (key, vars) => {
      const table = strings[locale] || strings.en;
      let value = table[key] ?? strings.en[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([name, raw]) => {
          const rendered = typeof raw === "number" ? localizeDigits(raw, locale) : raw;
          value = value.replace(`{${name}}`, rendered);
        });
      }
      return value;
    },
    [locale]
  );

  const price = useCallback(
    (usdAmount) => formatMoney(usdAmount, currency, locale),
    [currency, locale]
  );

  const num = useCallback((value) => localizeDigits(value, locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      isRTL: locale === "ar",
      currency,
      currencyMeta: getCurrency(currency),
      setCurrency,
      t,
      price,
      num,
    }),
    [locale, setLocale, currency, setCurrency, t, price, num]
  );

  return (
    <StoreSettingsContext.Provider value={value}>{children}</StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error("useStoreSettings must be used inside a StoreSettingsProvider");
  }
  return context;
}

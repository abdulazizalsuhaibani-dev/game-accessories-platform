import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useStoreSettings } from "../../context/StoreSettings";

export const SITE_NAME = "Game/Acc";

/** Builds "Section · Game/Acc", or the brand plus tagline on the home page. */
export function formatTitle(section) {
  return section ? `${section} · ${SITE_NAME}` : SITE_NAME;
}

/**
 * Keeps the browser tab in step with the route and the selected language.
 *
 * Mounted inside the router and above the routes, so it covers the pages that
 * sit outside Layout (sign in, register) as well as the ones inside it.
 */
export default function DocumentTitle() {
  const { pathname } = useLocation();
  const { t, locale } = useStoreSettings();

  useEffect(() => {
    // The product page owns its own title — it only knows the product name
    // once the fetch resolves, so skipping it here avoids the two fighting.
    if (/^\/products\/[^/]+/.test(pathname)) return;

    const sections = [
      [/^\/$/, null],
      [/^\/products$/, t("nav.shop")],
      [/^\/cart$/, t("cart.title")],
      [/^\/wishlist$/, t("wishlist.title")],
      [/^\/checkout$/, t("checkout.title")],
      [/^\/profile$/, t("profile.title")],
      [/^\/login$/, t("auth.signIn")],
      [/^\/signUp$/, t("auth.createAccount")],
      [/^\/dashboard$/, `${t("admin.label")} · ${t("admin.overview")}`],
      [/^\/dashboard\/Products$/, `${t("admin.label")} · ${t("admin.products")}`],
      [/^\/dashboard\/Orders$/, `${t("admin.label")} · ${t("admin.orders")}`],
      [/^\/dashboard\/Users$/, `${t("admin.label")} · ${t("admin.users")}`],
    ];

    const match = sections.find(([pattern]) => pattern.test(pathname));

    if (!match) {
      document.title = formatTitle(t("error.pageTitle"));
      return;
    }

    const [, section] = match;
    document.title = section
      ? formatTitle(section)
      : `${SITE_NAME} — ${t("hero.titleA")} ${t("hero.titleB")}`;
  }, [pathname, t, locale]);

  return null;
}

import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Brand from "../shared/Brand";
import Ticker from "./Ticker";
import CurrencyMenu from "./CurrencyMenu";
import LanguageSwitch from "./LanguageSwitch";
import ThemeSwitch from "./ThemeSwitch";
import { useStoreSettings } from "../../context/StoreSettings";

export default function Header(prop) {
  const { isAuthenticated, isUserDataLoading, userData, setUserData, cartCount } = prop;
  const { t, num } = useStoreSettings();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleLogout() {
    setUserData(null);
    localStorage.removeItem("token");
    navigate("/");
  }

  function handleSearch(event) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : "/products");
  }

  const isAdmin = isAuthenticated && userData?.role === "Admin";

  const navItems = [
    { to: "/", label: t("nav.home"), end: true },
    { to: "/products", label: t("nav.shop"), end: false },
    { to: "/wishlist", label: t("nav.wishlist"), end: false },
    ...(isAdmin ? [{ to: "/dashboard", label: t("nav.dashboard"), end: false }] : []),
  ];

  const navClass = ({ isActive }) =>
    `telemetry text-xs tracking-badge transition-colors ${
      isActive ? "text-acid" : "text-dim hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-30 bg-chassis">
      <Ticker />

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-b border-line bg-panel px-4 py-2.5 sm:h-[66px] sm:flex-nowrap sm:justify-between sm:px-7 sm:py-0">
        <div className="flex items-center gap-6 lg:gap-9">
          <Brand />
          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <form
            onSubmit={handleSearch}
            className="hidden h-9 min-w-[200px] items-center gap-2 border border-line bg-void px-3 focus-within:border-acid xl:flex"
          >
            <span className="font-mono text-[11px] font-semibold text-muted" aria-hidden="true">
              /
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("nav.search")}
              aria-label={t("nav.search")}
              className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-muted"
            />
          </form>

          <CurrencyMenu />
          <LanguageSwitch />
          <ThemeSwitch />

          <Link
            to="/cart"
            className="flex h-9 items-center gap-2 border border-line px-3.5 telemetry text-[11px] tracking-badge text-ink transition-colors hover:border-acid hover:text-acid"
          >
            <span className="max-sm:sr-only">{t("nav.cart")}</span>
            <span className="bg-magenta px-1.5 py-[3px] text-[10px] text-white">
              {num(String(cartCount ?? 0).padStart(2, "0"))}
            </span>
          </Link>

          {/* Below sm the account actions live in the bottom tab bar and on the
              profile screen, so the header keeps only the store controls. */}
          {isUserDataLoading ? null : isAuthenticated ? (
            <div className="hidden items-center gap-2.5 sm:flex">
              <Link
                to="/profile"
                className="flex h-9 items-center border border-line px-3.5 telemetry text-[11px] tracking-badge text-ink transition-colors hover:border-acid hover:text-acid"
              >
                {t("nav.profile")}
              </Link>
              <button type="button" onClick={handleLogout} className="h-9 shadow-none btn-acid">
                {t("nav.signOut")}
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden h-9 shadow-none btn-acid sm:inline-flex">
              {t("nav.signIn")}
            </Link>
          )}
        </div>
      </div>

      {/* Below lg the desktop nav next to the logo is hidden, so its links
          (plus account access) get their own stacked row here instead of a
          fixed bar that would float over page content while scrolling. */}
      <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-b border-line bg-panel px-4 py-2.5 lg:hidden">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
            {item.label}
          </NavLink>
        ))}

        {/* sm and up already show account access in the controls row above. */}
        {isUserDataLoading ? null : isAuthenticated ? (
          <>
            <NavLink
              to="/profile"
              end={false}
              className={(state) => `${navClass(state)} sm:hidden`}
            >
              {t("nav.profile")}
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="telemetry text-xs tracking-badge text-dim transition-colors hover:text-ink sm:hidden"
            >
              {t("nav.signOut")}
            </button>
          </>
        ) : (
          <NavLink to="/login" end={false} className={(state) => `${navClass(state)} sm:hidden`}>
            {t("nav.signIn")}
          </NavLink>
        )}
      </nav>
    </header>
  );
}

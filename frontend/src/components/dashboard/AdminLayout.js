import React from "react";
import { NavLink } from "react-router-dom";
import Brand from "../shared/Brand";
import { useStoreSettings } from "../../context/StoreSettings";

/**
 * The admin chassis from screens 08-11: a 220px rail with the OPS mark and the
 * Manage nav, and a topbar carrying the section title and its primary action.
 */
export default function AdminLayout({ userData, counts, title, meta, actions, children }) {
  const { t, num } = useStoreSettings();

  const items = [
    { to: "/dashboard", end: true, label: t("admin.overview") },
    { to: "/dashboard/Products", end: false, label: t("admin.products"), count: counts.products },
    {
      to: "/dashboard/Orders",
      end: false,
      label: t("admin.orders"),
      count: counts.unshipped,
      alert: true,
    },
    { to: "/dashboard/Users", end: false, label: t("admin.users"), count: counts.users },
  ];

  const nameParts = [userData?.firstName, userData?.lastName].filter(Boolean);
  const initials = nameParts.map((part) => part[0]).join("").toUpperCase();
  const displayName = nameParts.join(" ");

  return (
    <div className="flex min-h-[calc(100vh-94px)] bg-chassis max-lg:flex-col">
      <div className="flex w-[220px] flex-none flex-col border-line bg-panel max-lg:w-full max-lg:border-b lg:border-e">
        <div className="flex h-[66px] items-center gap-2.5 border-b border-line px-[18px]">
          <Brand to="/" size="sm" badge={t("admin.ops")} />
        </div>

        <nav className="flex flex-col gap-[3px] p-3 pt-4">
          <div className="px-2 pb-2.5 font-mono text-[9px] font-semibold uppercase tracking-[.16em] text-muted">
            {t("admin.manage")}
          </div>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2 py-2.5 telemetry text-[11px] tracking-badge transition-colors ${
                  isActive ? "bg-acid text-void" : "text-dim hover:text-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  {item.count != null ? (
                    <span
                      className={`ms-auto ${
                        item.alert && item.count > 0 && !isActive
                          ? "bg-magenta px-1.5 py-0.5 text-[10px] text-white"
                          : isActive
                            ? "text-void"
                            : "text-muted"
                      }`}
                    >
                      {num(item.count.toLocaleString("en-US"))}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {userData ? (
          <div className="mt-auto flex items-center gap-2.5 border-t border-line p-4 max-lg:hidden">
            <div className="flex h-[30px] w-[30px] flex-none items-center justify-center bg-line font-display text-xs font-bold text-acid">
              {initials || "AD"}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-ink">{displayName}</div>
              <div className="mt-1 telemetry text-[9px] font-medium text-muted">
                {t("admin.label")}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex h-[66px] items-center justify-between gap-4 border-b border-line bg-panel px-6">
          <div>
            <div className="telemetry text-[10px] text-muted">{t("admin.label")}</div>
            <h1 className="m-0 mt-1.5 font-display text-[19px] font-bold uppercase text-ink">
              {title}
              {meta ? <span className="ms-2 text-[13px] text-muted">{meta}</span> : null}
            </h1>
          </div>
          <div className="flex items-center gap-2.5">{actions}</div>
        </div>

        {children}
      </div>
    </div>
  );
}

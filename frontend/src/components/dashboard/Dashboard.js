import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import useAdminCounts from "./useAdminCounts";
import { useStoreSettings } from "../../context/StoreSettings";
import { isShipped } from "../../utils/orderStatus";

export default function Dashboard({ userData }) {
  const { t, num } = useStoreSettings();
  const counts = useAdminCounts();

  const dash = "—";
  const show = (value) => (value == null ? dash : num(value.toLocaleString("en-US")));

  // The API exposes no revenue or refund figures, so the tile row reports the
  // four counts the store can actually source rather than showing dead metrics.
  const kpis = [
    { label: t("admin.orders"), value: show(counts.orders) },
    { label: t("admin.unshipped"), value: show(counts.unshipped) },
    { label: t("admin.products"), value: show(counts.products) },
    { label: t("admin.users"), value: show(counts.users) },
  ];

  const attention = [
    {
      to: "/dashboard/Orders",
      tone: "magenta",
      label: t("admin.blocking"),
      count: counts.unshipped,
      body: t("admin.blockingBody"),
      cta: t("admin.shipThem"),
    },
    {
      to: "/dashboard/Products",
      tone: "amber",
      label: t("admin.lowStock"),
      count: counts.lowStock,
      body: t("admin.lowStockBody"),
      cta: t("admin.restock"),
    },
    {
      to: "/dashboard/Products",
      tone: "muted",
      label: t("admin.incomplete"),
      count: counts.incomplete,
      body: t("admin.incompleteBody"),
      cta: t("admin.fixListings"),
    },
  ];

  const toneClasses = {
    magenta: { border: "border-magenta", dot: "bg-magenta", text: "text-magenta" },
    amber: { border: "border-line", dot: "bg-amber", text: "text-amber" },
    muted: { border: "border-line", dot: "bg-muted", text: "text-dim" },
  };

  return (
    <AdminLayout
      userData={userData}
      counts={counts}
      title={t("admin.overview")}
      actions={
        <Link to="/dashboard/Products" className="h-[34px] shadow-none btn-flat">
          {t("admin.addProduct")}
        </Link>
      }
    >
      <div className="grid gap-px border-b border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-chassis px-5 py-6">
            <div className="telemetry text-[10px] text-muted">{kpi.label}</div>
            <div className="mt-3.5 font-display text-[32px] font-bold leading-none text-ink">
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6 p-6">
        <section>
          <h2 className="mb-3.5 telemetry text-[11px] text-dim">{t("admin.needsAttention")}</h2>
          <div className="grid gap-3.5 lg:grid-cols-3">
            {attention.map((card) => {
              const tone = toneClasses[card.tone];
              return (
                <Link
                  key={card.label}
                  to={card.to}
                  className={`flex flex-col gap-2.5 border bg-panel p-[18px] ${tone.border} transition-colors hover:border-acid`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-[7px] w-[7px] flex-none ${tone.dot}`} aria-hidden="true" />
                    <span className={`telemetry text-[10px] ${tone.text}`}>{card.label}</span>
                  </div>
                  <div className="font-display text-[30px] font-bold leading-none text-ink">
                    {show(card.count)}
                  </div>
                  <div className="text-[13px] leading-relaxed text-dim">{card.body}</div>
                  <div className="mt-0.5 telemetry text-[10px] tracking-badge text-acid">
                    {card.cta} <span aria-hidden="true">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3.5 flex items-baseline justify-between gap-4">
            <h2 className="m-0 telemetry text-[11px] text-dim">{t("admin.latestOrders")}</h2>
            <Link to="/dashboard/Orders" className="telemetry text-[10px] tracking-badge">
              {t("admin.allOrders")} <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-panel">
                  {[
                    t("admin.order"),
                    t("admin.customer"),
                    t("admin.placed"),
                    t("admin.status"),
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-3.5 py-3 telemetry text-[10px] font-semibold text-muted"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {counts.latestOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3.5 py-8 text-center font-mono text-xs text-muted">
                      {t("admin.noOrders")}
                    </td>
                  </tr>
                ) : (
                  counts.latestOrders.map((order) => {
                    const shipped = isShipped(order);
                    return (
                      <tr key={order.id} className="border-b border-seam last:border-0">
                        <td className="px-3.5 py-3 font-mono text-xs text-dim">
                          {String(order.id).slice(0, 8)}
                        </td>
                        <td className="px-3.5 py-3 text-[13px] text-ink">
                          {order.customerName || String(order.userId ?? "").slice(0, 8) || dash}
                        </td>
                        <td className="px-3.5 py-3 font-mono text-xs text-dim">
                          {order.orderDate ? String(order.orderDate).slice(0, 10) : dash}
                        </td>
                        <td className="px-3.5 py-3">
                          <span
                            className={`status-pill ${
                              shipped
                                ? "border border-acid text-acid"
                                : "bg-magenta text-white"
                            }`}
                          >
                            {shipped ? "SHIPPED" : "UNSHIPPED"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

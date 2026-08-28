import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE, authHeaders } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";
import { ORDER_STATUS, isShipped, normalizeStatus } from "../../utils/orderStatus";

// The API splits a customer's orders across two endpoints on IsDelivered:
// /Orders/user/{id} answers with the ones still in flight and
// /Orders/user/{id}/ordershistory with the delivered ones. Neither is the whole
// list, so both are read and merged here.
//
// Limit is not optional: PaginationOptions.Limit defaults to 0 on the server and
// the repository applies it as Take(Limit), so omitting it returns nothing at all.
const PAGE_LIMIT = 50;

const STATUS_LABELS = {
  [ORDER_STATUS.ordered]: "orders.statusOrdered",
  [ORDER_STATUS.shipped]: "orders.statusShipped",
  [ORDER_STATUS.onDelivery]: "orders.statusOnDelivery",
  [ORDER_STATUS.delivered]: "orders.statusDelivered",
};

export default function OrderHistory({ userId }) {
  const { t, num } = useStoreSettings();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!userId) return undefined;

    let active = true;
    const params = { Limit: PAGE_LIMIT, Offset: 0 };
    const request = (path) =>
      axios.get(`${API_BASE}/Orders/user/${userId}${path}`, {
        headers: authHeaders(),
        params,
      });

    setLoading(true);
    setFailed(false);

    Promise.allSettled([request(""), request("/ordershistory")])
      .then((results) => {
        if (!active) return;

        const rows = results
          .filter((result) => result.status === "fulfilled")
          .flatMap((result) =>
            Array.isArray(result.value.data) ? result.value.data : []
          );

        // Only report a failure when neither half answered — one endpoint being
        // down should still show whatever the other returned.
        if (results.every((result) => result.status === "rejected")) {
          setFailed(true);
        }

        rows.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setOrders(rows);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  // The API answers in UTC ("2026-08-26T21:00:00Z"), so the ISO string's own date
  // is a day early for anything placed after 21:00 in Riyadh. Read the day back
  // out in the viewer's timezone instead of slicing the string, then let num()
  // carry it into Arabic-Indic digits the way the rest of the store does.
  const day = (value) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const date = String(parsed.getDate()).padStart(2, "0");
    return num(`${parsed.getFullYear()}-${month}-${date}`);
  };

  function statusLabel(order) {
    const key = STATUS_LABELS[normalizeStatus(order)];
    return key ? t(key) : order.orderStatus || t("orders.statusUnknown");
  }

  function shipTo(order) {
    const line = [order.address, order.city, order.state]
      .map((part) => (part || "").trim())
      .filter(Boolean)
      .join(", ");
    return line || "—";
  }

  return (
    <section className="mt-10">
      <h2 className="m-0 mb-4 telemetry text-[11px] text-ink">{t("orders.title")}</h2>

      {loading ? (
        <p className="m-0 text-[15px] text-dim">{t("common.loading")}</p>
      ) : failed ? (
        <p className="m-0 text-[15px] text-magenta">{t("orders.error")}</p>
      ) : orders.length === 0 ? (
        <p className="m-0 text-[15px] text-dim">{t("orders.empty")}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-px border border-line bg-line p-0">
          {orders.map((order) => (
            <li key={order.id} className="bg-panel p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[11px] text-muted">
                  {t("orders.ref")} {num(String(order.id).slice(0, 8).toUpperCase())}
                </span>
                <span
                  className={`status-pill ${
                    isShipped(order)
                      ? "border border-acid text-acid"
                      : "bg-magenta text-white"
                  }`}
                >
                  {statusLabel(order)}
                </span>
              </div>

              <dl className="m-0 mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <dt className="telemetry text-[10px] text-muted">
                    {t("orders.placed")}
                  </dt>
                  <dd className="m-0 mt-1 text-[15px] text-ink">{day(order.orderDate)}</dd>
                </div>
                <div>
                  <dt className="telemetry text-[10px] text-muted">
                    {t("orders.estDelivery")}
                  </dt>
                  <dd className="m-0 mt-1 text-[15px] text-ink">{day(order.shipDate)}</dd>
                </div>
                <div>
                  <dt className="telemetry text-[10px] text-muted">
                    {t("orders.shipTo")}
                  </dt>
                  <dd className="m-0 mt-1 text-[15px] text-ink">{shipTo(order)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

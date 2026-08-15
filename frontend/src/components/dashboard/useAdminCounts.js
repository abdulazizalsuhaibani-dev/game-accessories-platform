import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE, authHeaders } from "../../api";

/**
 * Sidebar and KPI figures for the admin screens. Each source is independent —
 * one endpoint failing (or the caller not being allowed to read it) leaves that
 * count null rather than blanking the whole shell.
 */
export default function useAdminCounts() {
  const [counts, setCounts] = useState({
    products: null,
    orders: null,
    users: null,
    unshipped: null,
    lowStock: null,
    incomplete: null,
    revenue: null,
    latestOrders: [],
  });

  useEffect(() => {
    let cancelled = false;
    const headers = authHeaders();

    axios
      .get(`${API_BASE}/Products?Limit=100&Offset=0`)
      .then((response) => {
        if (cancelled) return;
        const products = response.data.products ?? [];
        setCounts((current) => ({
          ...current,
          products: response.data.productsCount ?? products.length,
          lowStock: products.filter((product) => product.sku > 0 && product.sku < 5).length,
          incomplete: products.filter(
            (product) => !product.productImage || !product.description
          ).length,
        }));
      })
      .catch(() => {});

    axios
      .get(`${API_BASE}/Users`, { headers })
      .then((response) => {
        if (cancelled) return;
        setCounts((current) => ({ ...current, users: response.data.length }));
      })
      .catch(() => {});

    axios
      .get(`${API_BASE}/Orders?limit=100`, { headers })
      .then((response) => {
        if (cancelled) return;
        const orders = response.data ?? [];
        const isUnshipped = (order) => !order.shipDate || order.orderStatus === "Pending";
        setCounts((current) => ({
          ...current,
          orders: orders.length,
          unshipped: orders.filter(isUnshipped).length,
          latestOrders: [...orders]
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 4),
        }));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return counts;
}

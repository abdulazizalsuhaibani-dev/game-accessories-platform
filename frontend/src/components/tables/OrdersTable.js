import React, { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import AdminTableToolbar from "./AdminTableToolbar";
import { API_BASE, authHeaders } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";

export default function OrdersTable(prop) {
  const { setSnackBarMessage, setOpenErrorSnackBar } = prop;
  const { t } = useStoreSettings();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [unshippedOnly, setUnshippedOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_BASE}/Orders?limit=100`, { headers: authHeaders() })
      .then((response) => {
        if (!cancelled) setRows(response.data ?? []);
      })
      .catch((error) => {
        if (cancelled) return;
        setSnackBarMessage(`Error: ${error}`);
        setOpenErrorSnackBar(true);
      });
    return () => {
      cancelled = true;
    };
  }, [setSnackBarMessage, setOpenErrorSnackBar]);

  const columns = [
    { field: "id", headerName: "Order ID", width: 180 },
    { field: "userId", headerName: "User ID", width: 180 },
    { field: "orderDate", headerName: "Placed", width: 160 },
    { field: "shipDate", headerName: "Shipped", width: 160 },
    {
      field: "orderStatus",
      headerName: "Status",
      width: 130,
      renderCell: ({ row }) => {
        const shipped = Boolean(row.shipDate);
        return (
          <span
            className={`status-pill ${
              shipped ? "border border-acid text-acid" : "bg-magenta text-white"
            }`}
          >
            {row.orderStatus || (shipped ? "SHIPPED" : "UNSHIPPED")}
          </span>
        );
      },
    },
    { field: "address", headerName: "Address", width: 200 },
    { field: "city", headerName: "City", width: 140 },
    { field: "state", headerName: "State", width: 140 },
    { field: "postalCode", headerName: "Postal ZIP", width: 110 },
  ];

  const visibleRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (unshippedOnly && row.shipDate) return false;
      if (!term) return true;
      return `${row.id} ${row.userId} ${row.city} ${row.address}`.toLowerCase().includes(term);
    });
  }, [rows, query, unshippedOnly]);

  return (
    <div>
      <AdminTableToolbar query={query} setQuery={setQuery} placeholder={t("admin.searchOrders")}>
        <button
          type="button"
          onClick={() => setUnshippedOnly((current) => !current)}
          aria-pressed={unshippedOnly}
          className={`flex h-9 items-center whitespace-nowrap border px-3 font-mono text-[11px] font-medium tracking-[.06em] transition-colors ${
            unshippedOnly ? "border-magenta text-magenta" : "border-line text-ink hover:border-edge"
          }`}
        >
          {t("admin.unshipped")}
          {unshippedOnly ? " ✕" : ""}
        </button>
      </AdminTableToolbar>

      <Box sx={{ height: 560, width: "100%" }}>
        <DataGrid rows={visibleRows} columns={columns} disableRowSelectionOnClick />
      </Box>
    </div>
  );
}

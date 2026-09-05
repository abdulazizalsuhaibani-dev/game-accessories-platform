import React, { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GridRowModes,
} from "@mui/x-data-grid";
import axios from "axios";
import AdminTableToolbar from "./AdminTableToolbar";
import { API_BASE, authHeaders } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";
import { isShipped, isUnshipped } from "../../utils/orderStatus";

// Exactly OrdersController.orderStatuses, Title Cased to match what the service
// writes on creation ("Ordered") — the validation is case-insensitive, but
// picking the same casing keeps every existing row's status preselected
// correctly in the dropdown instead of landing on no selection.
const STATUS_OPTIONS = ["Ordered", "Shipped", "On Delivery", "Delivered"].map((value) => ({
  value,
  label: value,
}));

// The API answers in UTC ISO strings ("2026-08-15T17:12:36.210634Z"); the grid
// used to render those verbatim. Intl reads the viewer's own locale and
// timezone, same as the customer-facing order history's `day()` helper.
function formatOrderDate(value, locale) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export default function OrdersTable(prop) {
  const { setSnackBarMessage, setOpenSuccessSnackBar, setOpenErrorSnackBar } = prop;
  const { t, locale } = useStoreSettings();
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
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

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () =>
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });

  const handleSaveClick = (id) => () =>
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });

  const handleCancelClick = (id) => () =>
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

  // Only the status, the ship date, or both — never the fields the admin didn't
  // touch. ShipDate must be in the future to pass the API's own validation, and
  // most existing orders' promised delivery date has long since passed, so
  // resending it unchanged on a status-only edit would 400 on almost every row.
  const processRowUpdate = async (newRow, oldRow) => {
    const payload = {};
    if (newRow.orderStatus !== oldRow.orderStatus) {
      payload.orderStatus = newRow.orderStatus;
    }
    const newShipDate =
      newRow.shipDate instanceof Date ? newRow.shipDate.toISOString() : newRow.shipDate;
    const oldShipDate =
      oldRow.shipDate instanceof Date ? oldRow.shipDate.toISOString() : oldRow.shipDate;
    if (newShipDate !== oldShipDate) {
      payload.shipDate = newShipDate;
    }
    if (Object.keys(payload).length === 0) return oldRow;

    try {
      await axios.put(`${API_BASE}/Orders/${newRow.id}`, payload, { headers: authHeaders() });
      setSnackBarMessage("Order successfully updated!");
      setOpenSuccessSnackBar(true);
      return newRow;
    } catch (error) {
      setSnackBarMessage(`Error: ${error}`);
      setOpenErrorSnackBar(true);
      return oldRow;
    }
  };

  const columns = [
    { field: "id", headerName: "Order ID", width: 180 },
    {
      field: "customerName",
      headerName: "Customer",
      width: 180,
      // the API leaves this null once the customer is deleted; the id is all that is
      // left to identify the order by
      valueGetter: (value, row) => value || row.userId,
    },
    {
      field: "orderDate",
      headerName: "Placed",
      width: 180,
      valueFormatter: (value) => formatOrderDate(value, locale),
    },
    // ShipDate is the delivery date promised at checkout, not a dispatch timestamp
    {
      field: "shipDate",
      headerName: "Est. delivery",
      width: 180,
      type: "dateTime",
      editable: true,
      valueGetter: (value) => (value ? new Date(value) : null),
      valueFormatter: (value) => formatOrderDate(value, locale),
    },
    {
      field: "orderStatus",
      headerName: "Status",
      width: 150,
      editable: true,
      type: "singleSelect",
      valueOptions: STATUS_OPTIONS,
      renderCell: ({ row }) => {
        const shipped = isShipped(row);
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
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label="Save"
              sx={{ color: "primary.main" }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Cancel"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }
        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const visibleRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (unshippedOnly && !isUnshipped(row)) return false;
      if (!term) return true;
      return `${row.id} ${row.customerName ?? ""} ${row.userId} ${row.city} ${row.address}`
        .toLowerCase()
        .includes(term);
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

      <Box sx={{ height: 560, width: "100%", "& .actions": { color: "text.secondary" } }}>
        <DataGrid
          rows={visibleRows}
          columns={columns}
          editMode="row"
          disableRowSelectionOnClick
          rowModesModel={rowModesModel}
          onRowModesModelChange={setRowModesModel}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={() => {}}
        />
      </Box>
    </div>
  );
}

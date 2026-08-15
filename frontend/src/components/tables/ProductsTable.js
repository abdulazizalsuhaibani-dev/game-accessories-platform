import React, { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GridRowModes,
} from "@mui/x-data-grid";
import axios from "axios";
import ProductEditToolbar from "./ProductEditToolbar";
import AdminTableToolbar from "./AdminTableToolbar";
import { API_BASE, authHeaders } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";

// Fields the catalogue PUT rejects — stripped before an edited row is sent.
const READ_ONLY_FIELDS = [
  "addedDate",
  "averageRating",
  "id",
  "isNew",
  "productId",
  "subCategoryId",
  "subCategoryName",
];

export default function ProductsTable(prop) {
  const { setSnackBarMessage, setOpenSuccessSnackBar, setOpenErrorSnackBar } = prop;
  const { t } = useStoreSettings();
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [query, setQuery] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_BASE}/Products?Limit=100&Offset=0`)
      .then((response) => {
        if (cancelled) return;
        setRows(
          (response.data.products ?? []).map((product) => ({
            ...product,
            id: product.productId,
          }))
        );
      })
      .catch(() => {
        if (cancelled) return;
        setSnackBarMessage("We couldn't load the product list");
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

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
    const editedRow = rows.find((row) => row.id === id);
    if (editedRow?.isNew) setRows(rows.filter((row) => row.id !== id));
  };

  const handleDeleteClick = (id) => () => {
    const target = rows.find((row) => row.id === id);
    if (!target) return;
    // The row is only dropped once the server confirms; the previous version
    // read a flag that was always still false when it was checked.
    axios
      .delete(`${API_BASE}/Products/${target.productId}`, { headers: authHeaders() })
      .then(() => {
        setRows((current) => current.filter((row) => row.id !== id));
        setSnackBarMessage("Product successfully deleted!");
        setOpenSuccessSnackBar(true);
      })
      .catch((error) => {
        setSnackBarMessage(`Error: ${error}`);
        setOpenErrorSnackBar(true);
      });
  };

  const processRowUpdate = async (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    const payload = { ...updatedRow };
    READ_ONLY_FIELDS.forEach((field) => delete payload[field]);

    try {
      await axios.put(`${API_BASE}/Products/${newRow.productId}`, payload, {
        headers: authHeaders(),
      });
      setSnackBarMessage("Product successfully updated!");
      setOpenSuccessSnackBar(true);
      return updatedRow;
    } catch (error) {
      setSnackBarMessage(`Error: ${error}`);
      setOpenErrorSnackBar(true);
      // Returning the original row rolls the grid back to the saved values.
      return rows.find((row) => row.id === newRow.id) ?? newRow;
    }
  };

  const columns = [
    {
      field: "productImage",
      headerName: "Img",
      width: 64,
      sortable: false,
      editable: true,
      renderCell: (params) =>
        params.value ? (
          <img
            src={params.value}
            alt=""
            className="h-[38px] w-[38px] bg-well object-contain p-1"
          />
        ) : (
          <span className="font-mono text-[11px] text-muted">—</span>
        ),
    },
    { field: "productName", headerName: "Name", width: 220, editable: true },
    { field: "productColor", headerName: "Color", width: 110, editable: true },
    { field: "description", headerName: "Description", width: 200, editable: true },
    { field: "sku", headerName: "Stock", type: "number", width: 90, editable: true },
    { field: "productPrice", headerName: "Price", type: "number", width: 100, editable: true },
    { field: "weight", headerName: "Weight", type: "number", width: 90, editable: true },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      sortable: false,
      renderCell: ({ row }) => {
        if (!row.sku) {
          return <span className="status-pill border border-edge text-dim">OUT</span>;
        }
        if (row.sku < 5) {
          return <span className="status-pill border border-amber text-amber">LOW</span>;
        }
        return <span className="status-pill border border-acid text-acid">LIVE</span>;
      },
    },
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
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            sx={{ color: "secondary.main" }}
          />,
        ];
      },
    },
  ];

  const visibleRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (lowStockOnly && !(row.sku > 0 && row.sku < 5)) return false;
      if (!term) return true;
      return `${row.productName} ${row.productColor} ${row.productId}`
        .toLowerCase()
        .includes(term);
    });
  }, [rows, query, lowStockOnly]);

  return (
    <div>
      <AdminTableToolbar
        query={query}
        setQuery={setQuery}
        placeholder={t("admin.searchProducts")}
      >
        <button
          type="button"
          onClick={() => setLowStockOnly((current) => !current)}
          aria-pressed={lowStockOnly}
          className={`flex h-9 items-center whitespace-nowrap border px-3 font-mono text-[11px] font-medium tracking-[.06em] transition-colors ${
            lowStockOnly ? "border-amber text-amber" : "border-line text-ink hover:border-edge"
          }`}
        >
          {t("admin.lowStock")}
          {lowStockOnly ? " ✕" : ""}
        </button>
      </AdminTableToolbar>

      <Box sx={{ height: 560, width: "100%", "& .actions": { color: "text.secondary" } }}>
        <DataGrid
          rows={visibleRows}
          columns={columns}
          editMode="row"
          checkboxSelection
          disableRowSelectionOnClick
          rowModesModel={rowModesModel}
          onRowModesModelChange={setRowModesModel}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={() => {}}
          slots={{ toolbar: ProductEditToolbar }}
          slotProps={{
            toolbar: {
              setRows,
              setRowModesModel,
              setOpenErrorSnackBar,
              setOpenSuccessSnackBar,
              setSnackBarMessage,
            },
          }}
        />
      </Box>
    </div>
  );
}

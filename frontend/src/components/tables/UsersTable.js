import React, { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import axios from "axios";
import AdminTableToolbar from "./AdminTableToolbar";
import { API_BASE, authHeaders } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";

export default function UsersTable(prop) {
  const { setSnackBarMessage, setOpenSuccessSnackBar, setOpenErrorSnackBar } = prop;
  const { t } = useStoreSettings();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_BASE}/Users`, { headers: authHeaders() })
      .then((response) => {
        if (cancelled) return;
        setRows(response.data.map((user) => ({ ...user, id: user.userId })));
      })
      .catch(() => {
        if (cancelled) return;
        setSnackBarMessage("We couldn't load the user list");
        setOpenErrorSnackBar(true);
      });
    return () => {
      cancelled = true;
    };
  }, [setSnackBarMessage, setOpenErrorSnackBar]);

  const handleDeleteClick = (id) => () => {
    const target = rows.find((row) => row.id === id);
    if (!target) return;
    // Row removal waits on the server, matching the fix applied to products.
    axios
      .delete(`${API_BASE}/Users/${target.userId}`, { headers: authHeaders() })
      .then(() => {
        setRows((current) => current.filter((row) => row.id !== id));
        setSnackBarMessage("User successfully deleted!");
        setOpenSuccessSnackBar(true);
      })
      .catch((error) => {
        setSnackBarMessage(`Error: ${error}`);
        setOpenErrorSnackBar(true);
      });
  };

  const columns = [
    { field: "firstName", headerName: "First name", width: 150 },
    { field: "lastName", headerName: "Last name", width: 150 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "phoneNumber", headerName: "Phone", width: 150 },
    { field: "birthDate", headerName: "Birthday", width: 140 },
    {
      field: "role",
      headerName: "Role",
      width: 110,
      renderCell: ({ value }) => (
        <span
          className={`status-pill ${
            value === "Admin" ? "border border-acid text-acid" : "border border-edge text-dim"
          }`}
        >
          {String(value ?? "").toUpperCase()}
        </span>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 90,
      getActions: ({ id }) => [
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={handleDeleteClick(id)}
          sx={{ color: "secondary.main" }}
        />,
      ],
    },
  ];

  const visibleRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      `${row.firstName} ${row.lastName} ${row.email}`.toLowerCase().includes(term)
    );
  }, [rows, query]);

  return (
    <div>
      <AdminTableToolbar query={query} setQuery={setQuery} placeholder={t("admin.searchUsers")} />
      <Box sx={{ height: 560, width: "100%" }}>
        <DataGrid rows={visibleRows} columns={columns} disableRowSelectionOnClick />
      </Box>
    </div>
  );
}

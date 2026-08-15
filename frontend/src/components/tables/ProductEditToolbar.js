import React, { useState } from "react";
import { Popover } from "@mui/material";
import { GridRowModes, GridToolbarContainer } from "@mui/x-data-grid";
import axios from "axios";
import { API_BASE, authHeaders } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";

const BLANK_PRODUCT = {
  productName: "",
  productColor: "",
  productImage: "",
  description: "",
  sku: 0,
  productPrice: 0,
  weight: 0,
  subCategoryId: "",
  subCategoryName: "",
};

const NUMERIC_FIELDS = ["sku", "productPrice", "weight"];

const FIELDS = [
  { id: "productName", label: "Product name" },
  { id: "productImage", label: "Product image URL" },
  { id: "productColor", label: "Product colour" },
  { id: "description", label: "Description", multiline: true },
  { id: "sku", label: "SKU", type: "number" },
  { id: "productPrice", label: "Price", type: "number" },
  { id: "weight", label: "Weight", type: "number" },
  { id: "subCategoryId", label: "Sub-category ID" },
  { id: "subCategoryName", label: "Sub-category name" },
];

export default function ProductEditToolbar(props) {
  const {
    setRows,
    setRowModesModel,
    setOpenErrorSnackBar,
    setOpenSuccessSnackBar,
    setSnackBarMessage,
  } = props;
  const { t } = useStoreSettings();
  const [anchorEl, setAnchorEl] = useState(null);
  const [productData, setProductData] = useState(BLANK_PRODUCT);
  const [saving, setSaving] = useState(false);

  const open = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);

  function onChangeHandler(event) {
    const { id, value } = event.target;
    setProductData((current) => ({
      ...current,
      [id]: NUMERIC_FIELDS.includes(id) ? Number(value) : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    axios
      .post(`${API_BASE}/Products`, productData, { headers: authHeaders() })
      .then((response) => {
        const created = response.data;
        setRows((oldRows) => [...oldRows, { ...created, id: created.productId }]);
        // Key the mode by the new row's own id — the previous version used the
        // popover's element id, so the entry never matched a row.
        setRowModesModel((oldModel) => ({
          ...oldModel,
          [created.productId]: { mode: GridRowModes.View },
        }));
        setProductData(BLANK_PRODUCT);
        setSnackBarMessage("Product successfully added!");
        setOpenSuccessSnackBar(true);
        handleClose();
      })
      .catch((error) => {
        setSnackBarMessage(`Error: ${error}`);
        setOpenErrorSnackBar(true);
      })
      .finally(() => setSaving(false));
  }

  return (
    <GridToolbarContainer>
      <button
        type="button"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        className="h-[34px] shadow-none btn-flat"
      >
        {t("admin.addProduct")}
      </button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <form onSubmit={handleSubmit} className="flex w-[320px] flex-col gap-3 p-4">
          <div className="telemetry text-[11px] text-ink">{t("admin.addProduct")}</div>

          {FIELDS.map((field) => (
            <div key={field.id}>
              <label className="field-label" htmlFor={field.id}>
                {field.label}
              </label>
              {field.multiline ? (
                <textarea
                  id={field.id}
                  rows={2}
                  value={productData[field.id]}
                  onChange={onChangeHandler}
                  className="field h-auto py-2.5"
                />
              ) : (
                <input
                  id={field.id}
                  type={field.type ?? "text"}
                  value={productData[field.id]}
                  onChange={onChangeHandler}
                  className="field h-9"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={saving || !productData.productName.trim()}
            className="mt-1 h-11 shadow-none btn-acid"
          >
            {saving ? t("common.loading") : t("admin.addProduct")}
          </button>
        </form>
      </Popover>
    </GridToolbarContainer>
  );
}

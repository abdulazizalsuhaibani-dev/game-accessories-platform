import React, { useState } from "react";
import { Popover } from "@mui/material";
import { GridRowModes, GridToolbarContainer } from "@mui/x-data-grid";
import axios from "axios";
import { API_BASE, authHeaders } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";
import useSubCategories from "./useSubCategories";

const BLANK_PRODUCT = {
  productName: "",
  brand: "",
  nameAr: "",
  descriptionAr: "",
  productColor: "",
  productImage: "",
  description: "",
  sku: 0,
  productPrice: 0,
  discountPercentage: 0,
  categoryId: "",
  subCategoryId: "",
};

// consulted by onChangeHandler to Number()-cast; a percentage left out of this
// list would post as a string and be rejected by the [Range] guard on the API
const NUMERIC_FIELDS = ["sku", "productPrice", "discountPercentage"];

const FIELDS = [
  { id: "productName", label: "Product name" },
  { id: "brand", label: "Brand" },
  { id: "nameAr", label: "Product name (Arabic)" },
  { id: "productImage", label: "Product image URL" },
  { id: "productColor", label: "Product colour" },
  { id: "description", label: "Description", multiline: true },
  { id: "descriptionAr", label: "Description (Arabic)", multiline: true },
  { id: "sku", label: "SKU", type: "number" },
  { id: "productPrice", label: "Price", type: "number" },
  // 0 means no sale. The sale window is left to the products grid rather than
  // added here: creation with a future-dated sale is not a case that comes up,
  // and two more date inputs in the popover earn nothing.
  { id: "discountPercentage", label: "Discount %", type: "number" },
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
  const [uploading, setUploading] = useState(false);
  const { categories, subCategories, loading: loadingCategories } = useSubCategories();

  // Uploads immediately on file choice and drops the returned url straight into the
  // same field a pasted url would have gone in - create/update never see the file.
  function onFileChosen(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    axios
      .post(`${API_BASE}/Products/image`, formData, { headers: authHeaders() })
      .then((response) => {
        setProductData((current) => ({ ...current, productImage: response.data.url }));
      })
      .catch((error) => {
        setSnackBarMessage(error.response?.data?.message ?? `Error: ${error}`);
        setOpenErrorSnackBar(true);
      })
      .finally(() => setUploading(false));
  }

  // the sub-category list only ever offers children of the chosen category, so a
  // product cannot land under a mismatched pair
  const subCategoryChoices = subCategories.filter(
    (subCategory) => subCategory.categoryId === productData.categoryId
  );

  // the gate used to check the name alone, so an empty sub-category reached the API as
  // an unbindable guid and came back as an opaque 400
  const canSubmit = Boolean(productData.productName.trim() && productData.subCategoryId);

  const open = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);

  function onChangeHandler(event) {
    const { id, value } = event.target;
    setProductData((current) => ({
      ...current,
      [id]: NUMERIC_FIELDS.includes(id) ? Number(value) : value,
      // a sub-category chosen under the old category would no longer be valid
      ...(id === "categoryId" ? { subCategoryId: "" } : null),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    // categoryId only drives the sub-category dropdown; the API derives the category
    // from the sub-category, and SubCategoryName is read from the looked-up row rather
    // than from anything the client sends
    const payload = { ...productData };
    delete payload.categoryId;

    axios
      .post(`${API_BASE}/Products`, payload, { headers: authHeaders() })
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
              {field.id === "productImage" ? (
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    id="productImageFile"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={onFileChosen}
                    disabled={uploading}
                    className="font-mono text-[11px] text-dim"
                  />
                  {uploading ? (
                    <span className="font-mono text-[11px] text-muted">{t("common.loading")}</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}

          <div>
            <label className="field-label" htmlFor="categoryId">
              Category
            </label>
            <select
              id="categoryId"
              value={productData.categoryId}
              onChange={onChangeHandler}
              disabled={loadingCategories}
              className="field h-9"
            >
              <option value="">
                {loadingCategories ? t("common.loading") : "Select a category"}
              </option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="subCategoryId">
              Sub-category
            </label>
            <select
              id="subCategoryId"
              value={productData.subCategoryId}
              onChange={onChangeHandler}
              disabled={!productData.categoryId}
              className="field h-9"
            >
              <option value="">
                {productData.categoryId ? "Select a sub-category" : "Choose a category first"}
              </option>
              {subCategoryChoices.map((subCategory) => (
                <option key={subCategory.subCategoryId} value={subCategory.subCategoryId}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving || uploading || !canSubmit}
            className="mt-1 h-11 shadow-none btn-acid"
          >
            {saving ? t("common.loading") : t("admin.addProduct")}
          </button>
        </form>
      </Popover>
    </GridToolbarContainer>
  );
}

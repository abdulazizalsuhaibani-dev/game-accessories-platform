import React from "react";
import { useStoreSettings } from "../../context/StoreSettings";

export default function OrderForm({ orderData, setOrderData }) {
  const { t } = useStoreSettings();

  function onChangeHandler(event) {
    const { id, value } = event.target;
    setOrderData({
      ...orderData,
      [id]: id === "postalCode" ? Number(value) : value,
    });
  }

  const fields = [
    { id: "address", label: t("checkout.street"), type: "text", wide: true },
    { id: "city", label: t("checkout.city"), type: "text" },
    { id: "state", label: t("checkout.state"), type: "text" },
    { id: "postalCode", label: t("checkout.zip"), type: "number" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.id} className={field.wide ? "sm:col-span-2" : undefined}>
          <label className="field-label" htmlFor={field.id}>
            {field.label}
          </label>
          <input
            id={field.id}
            type={field.type}
            value={orderData[field.id] || ""}
            onChange={onChangeHandler}
            placeholder={field.label}
            className="field"
          />
        </div>
      ))}
    </div>
  );
}

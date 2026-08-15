import React from "react";
import { useStoreSettings } from "../../context/StoreSettings";

const METHODS = [
  { value: "Visa", note: "•••• •••• •••• 4242" },
  { value: "Master Card", note: "•••• •••• •••• 8210" },
  { value: "PayPal", note: "Redirects to PayPal" },
];

export default function PaymentForm({ paymentData, setPaymentData }) {
  const { t } = useStoreSettings();

  return (
    <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
      <legend className="sr-only">{t("checkout.payment")}</legend>
      {METHODS.map((method) => {
        const selected = paymentData.paymentMethod === method.value;
        return (
          <label
            key={method.value}
            className={`flex cursor-pointer items-center gap-4 border bg-panel p-[18px] transition-colors ${
              selected ? "border-acid" : "border-line hover:border-edge"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.value}
              checked={selected}
              onChange={() => setPaymentData({ ...paymentData, paymentMethod: method.value })}
              className="sr-only"
            />
            <span className={`box-check h-[15px] w-[15px] ${selected ? "box-check-on" : ""}`} />
            <span className="flex-1">
              <span className="block text-[15px] font-semibold text-ink">{method.value}</span>
              <span className="mt-2 block font-mono text-xs text-dim">{method.note}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

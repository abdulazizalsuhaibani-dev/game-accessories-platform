import React from "react";
import { useStoreSettings } from "../../context/StoreSettings";

/**
 * The address step of checkout. The form instance itself lives in Checkout.js
 * rather than here, because the address line the API receives is composed from
 * fields spread across two steps — so one useForm has to see all of them.
 * `register` and `errors` come from that instance.
 *
 * Every rule mirrors OrderCreateDTO, because [ApiController] enforces those
 * annotations with a 400 on the third call of the checkout chain, by which
 * point the cart and the payment already exist.
 */
export default function OrderForm({ register, errors }) {
  const { t } = useStoreSettings();

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
            placeholder={field.label}
            className="field"
            {...register(field.id)}
          />
          {errors[field.id] ? (
            <p className="mt-1.5 font-mono text-[11px] text-magenta">
              {errors[field.id].message}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

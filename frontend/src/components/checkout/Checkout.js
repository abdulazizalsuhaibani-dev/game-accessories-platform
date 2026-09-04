import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import OrderForm from "../forms/OrderForm";
import PaymentForm from "../forms/PaymentForm";
import OrderSummary from "../cart/OrderSummary";
import { cartItemCount, cartSubtotal } from "../../utils/cart";
import { API_BASE, authHeaders } from "../../api";
import { productName } from "../../utils/productText";
import { effectivePrice } from "../../utils/pricing";
import { useStoreSettings } from "../../context/StoreSettings";

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

const DELIVERY_OPTIONS = [
  { id: "express", labelKey: "checkout.express", noteKey: "checkout.expressNote" },
  { id: "standard", labelKey: "checkout.standard", noteKey: "checkout.standardNote" },
  { id: "locker", labelKey: "checkout.locker", noteKey: "checkout.lockerNote" },
];

// Order.Address and OrderCreateDTO.Address are both [MaxLength(100)], and the
// column behind them is character varying(100). [ApiController] rejects a longer
// value with a 400 before the service runs — and the order is the third call of
// the chain, so by then the cart and the payment rows already exist and the
// stock is already gone. This number is not a display cap, it is the API's.
const ADDRESS_MAX = 100;
const ADDRESS_SEPARATOR = " — ";

// One composition, used by the validation rule and by the request alike, so the
// string that gets measured is the string that gets sent.
function composeAddressLine(address, deliveryLabel, notes) {
  return [address, deliveryLabel, notes]
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(ADDRESS_SEPARATOR);
}

// Built per language, and rebuilt when the delivery option changes, because the
// option's label is part of the address line and so eats into its budget. yup
// resolves a rule's message when the schema is constructed, so a schema built at
// import time would freeze whichever language was active then. Every rule names
// its own message — a bare rule falls back to a yup default written from the
// property key.
const buildSchema = (t, deliveryLabel) =>
  yup
    .object({
      address: yup
        .string()
        .trim()
        .required(t("validation.addressRequired"))
        .max(ADDRESS_MAX, t("validation.addressTooLong")),
      city: yup
        .string()
        .trim()
        .required(t("validation.cityRequired"))
        .min(2, t("validation.cityLength"))
        .max(50, t("validation.cityLength")),
      state: yup
        .string()
        .trim()
        .required(t("validation.stateRequired"))
        .min(2, t("validation.stateLength"))
        .max(50, t("validation.stateLength")),
      // An empty number input casts to NaN before .required() is consulted, so
      // typeError is the only place the "please enter one" message can live.
      postalCode: yup
        .number()
        .typeError(t("validation.zipRequired"))
        .integer(t("validation.zipRange"))
        .min(10000, t("validation.zipRange"))
        .max(99999, t("validation.zipRange"))
        .required(t("validation.zipRequired")),
      // The order model has no field for the delivery method or the courier
      // note, so both ride along on the address line. That makes the 100
      // characters a budget shared between three inputs, and the only honest
      // place to check it is the composed string. Truncating it to fit would
      // silently ship a customer a parcel to half an address.
      deliveryNotes: yup
        .string()
        .test("composed-address-fits", t("validation.addressLineTooLong"), function (value) {
          const composed = composeAddressLine(this.parent.address, deliveryLabel, value);
          return composed.length <= ADDRESS_MAX;
        }),
    })
    .required();

export default function Checkout(prop) {
  const {
    userData,
    setSnackBarMessage,
    setOpenErrorSnackBar,
    cart,
    setCart,
  } = prop;
  const { t, locale } = useStoreSettings();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [delivery, setDelivery] = useState("standard");
  const deliveryLabel = t(
    DELIVERY_OPTIONS.find((option) => option.id === delivery).labelKey
  );

  // The address fields and the courier note are one form even though they sit on
  // two different steps, because the rule that matters spans both of them.
  const resolver = useMemo(
    () => yupResolver(buildSchema(t, deliveryLabel)),
    [t, deliveryLabel]
  );
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    resolver,
    defaultValues: {
      address: "",
      city: "",
      state: "",
      postalCode: "",
      deliveryNotes: "",
    },
  });

  // yup resolves a message when the schema is built, so an error raised before
  // the customer switched language still holds the old language's string on
  // screen. Re-run the rules when the language flips — but only for a form that
  // is already showing an error, since validating one nobody has filled in yet
  // would light it up red for no reason.
  const errorCountRef = useRef(0);
  errorCountRef.current = Object.keys(errors).length;
  useEffect(() => {
    if (errorCountRef.current > 0) trigger();
  }, [t, trigger]);

  const addressValue = watch("address");
  const notesValue = watch("deliveryNotes");
  const addressRemaining =
    ADDRESS_MAX - composeAddressLine(addressValue, deliveryLabel, notesValue).length;

  const [paymentData, setPaymentData] = useState({
    paymentMethod: "",
    paymentDate: "",
    paymentStatus: false,
    totalPrice: 0,
    cartId: EMPTY_GUID,
    orderId: EMPTY_GUID,
    couponId: EMPTY_GUID,
  });

  const subtotal = cartSubtotal(cart);

  function handleDialogClose() {
    setOpenDialog(false);
    navigate("/products");
  }

  // Every address rule is checked here rather than at the end, so a value the
  // API would reject can never reach the chain that has already taken payment.
  async function goToDelivery() {
    const valid = await trigger([
      "address",
      "city",
      "state",
      "postalCode",
      "deliveryNotes",
    ]);
    if (valid) setStep(2);
  }

  async function goToPayment() {
    const valid = await trigger("deliveryNotes");
    if (valid) setStep(3);
  }

  // The field that failed may live on a step the customer has already left, so
  // send them back to it instead of reporting a field they cannot see.
  function onInvalid(formErrors) {
    if (
      formErrors.address ||
      formErrors.city ||
      formErrors.state ||
      formErrors.postalCode
    ) {
      setStep(1);
    } else if (formErrors.deliveryNotes) {
      setStep(2);
    }
    setSnackBarMessage(t("checkout.fixFields"));
    setOpenErrorSnackBar(true);
  }

  async function processOrder(formData) {
    if (!paymentData.paymentMethod) {
      setSnackBarMessage(t("checkout.paymentRequired"));
      setOpenErrorSnackBar(true);
      return;
    }
    setSubmitting(true);

    // The order model has no field for delivery method or courier notes, so
    // they ride along on the address line — the only channel that reaches the
    // merchant — instead of being silently dropped. The schema has already
    // proved this fits in ADDRESS_MAX; it is never truncated to make it fit.
    const addressLine = composeAddressLine(
      formData.address,
      deliveryLabel,
      formData.deliveryNotes
    );

    // Tracks which leg of the three-call chain failed, so the snackbar names
    // the step the user has to retry.
    let failureMessage = t("checkout.cartFailed");

    try {
      const cartResponse = await axios.post(
        `${API_BASE}/Carts`,
        {
          // Only the fields the cart endpoint expects — built fresh rather
          // than by stripping the live cart state, which the previous version
          // mutated in place.
          cartDetails: cart.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            sku: line.sku,
          })),
          userId: userData.userId,
        },
        { headers: authHeaders() }
      );

      failureMessage = t("checkout.paymentFailed");
      const paymentResponse = await axios.post(
        `${API_BASE}/Payments`,
        {
          ...paymentData,
          paymentDate: new Date().toISOString(),
          paymentStatus: true,
          cartId: cartResponse.data.id,
          totalPrice: cartResponse.data.totalPrice,
        },
        { headers: authHeaders() }
      );

      failureMessage = t("checkout.orderFailed");
      await axios.post(
        `${API_BASE}/Orders`,
        {
          userId: userData.userId,
          address: addressLine,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          coordinateX: 0,
          coordinateY: 0,
          paymentId: paymentResponse.data.paymentId,
          cartId: paymentResponse.data.cartId,
        },
        { headers: authHeaders() }
      );

      localStorage.removeItem("cart");
      localStorage.removeItem("cartId");
      setCart([]);
      setOpenDialog(true);
    } catch (error) {
      // The API answers a CustomException as { statusCode, message }. A DTO rule
      // rejected by [ApiController] instead comes back as ValidationProblemDetails,
      // which carries the offending fields under `errors` and no message at all —
      // so both shapes have to be read before falling back to the leg's own line.
      const body = error.response?.data;
      const validationDetail = body?.errors
        ? Object.values(body.errors).flat().join(" ")
        : "";
      setSnackBarMessage(body?.message || validationDetail || failureMessage);
      setOpenErrorSnackBar(true);
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    { number: 1, labelKey: "checkout.step1" },
    { number: 2, labelKey: "checkout.step2" },
    { number: 3, labelKey: "checkout.step3" },
  ];

  return (
    <div className="bg-chassis">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-4 sm:px-7">
        <h1 className="m-0 telemetry text-xs text-ink">{t("checkout.title")}</h1>

        <ol className="m-0 flex list-none flex-wrap p-0">
          {steps.map((entry) => {
            const done = entry.number < step;
            const active = entry.number === step;
            return (
              <li
                key={entry.number}
                aria-current={active ? "step" : undefined}
                className={`whitespace-nowrap px-4 py-2.5 telemetry text-[11px] tracking-badge ${
                  active
                    ? "bg-acid text-void"
                    : done
                      ? "bg-line text-dim"
                      : "border border-line text-muted"
                }`}
              >
                {t(entry.labelKey)}
                {done ? " ✓" : ""}
              </li>
            );
          })}
        </ol>

        <span className="telemetry text-[11px] font-medium tracking-badge text-muted">
          {t("checkout.secure")}
        </span>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6 border-line px-6 py-8 sm:px-7 lg:border-e">
          {step === 1 ? (
            <>
              <StepHeading title={t("checkout.personal")} />
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: t("checkout.firstName"), value: userData.firstName },
                  { label: t("checkout.lastName"), value: userData.lastName },
                  { label: t("checkout.email"), value: userData.email },
                  { label: t("checkout.phone"), value: userData.phoneNumber },
                ].map((entry) => (
                  <div key={entry.label}>
                    <span className="field-label">{entry.label}</span>
                    <div className="flex h-11 items-center border border-line bg-void px-3.5 text-sm text-muted">
                      {entry.value}
                    </div>
                  </div>
                ))}
              </div>

              <StepHeading title={t("checkout.address")} />
              <OrderForm register={register} errors={errors} />

              <div className="mt-1.5 flex gap-3">
                <button type="button" onClick={goToDelivery} className="h-[50px] flex-1 btn-acid">
                  {t("checkout.continueDelivery")}
                </button>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <StepHeading
                title={t("checkout.deliverySpeed")}
                sub={`${addressValue}, ${watch("city")}`}
              />

              <div className="flex flex-col gap-3">
                {DELIVERY_OPTIONS.map((option) => {
                  const selected = delivery === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-center gap-4 border bg-panel p-[18px] transition-colors ${
                        selected ? "border-acid" : "border-line hover:border-edge"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        checked={selected}
                        onChange={() => setDelivery(option.id)}
                        className="sr-only"
                      />
                      <span
                        className={`box-check h-[15px] w-[15px] ${selected ? "box-check-on" : ""}`}
                      />
                      <span className="flex-1">
                        <span className="block text-[15px] font-semibold text-ink">
                          {t(option.labelKey)}
                        </span>
                        <span className="mt-2 block font-mono text-xs text-dim">
                          {t(option.noteKey)}
                        </span>
                      </span>
                      <span className="font-display text-[17px] font-bold text-acid">
                        {t("cart.free")}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3.5 border-t border-line pt-5">
                <label className="telemetry text-[11px] text-dim" htmlFor="deliveryNotes">
                  {t("checkout.notes")}
                </label>
                <input
                  id="deliveryNotes"
                  placeholder={t("checkout.notesPlaceholder")}
                  className="field"
                  {...register("deliveryNotes")}
                />
                {errors.deliveryNotes ? (
                  <p className="mt-1.5 font-mono text-[11px] text-magenta">
                    {errors.deliveryNotes.message}
                  </p>
                ) : (
                  // The note shares the address line's 100 characters with the
                  // street address and the delivery label, so show what is left
                  // rather than letting the customer find out at the last step.
                  <p className="mt-1.5 font-mono text-[11px] text-dim">
                    {t("checkout.notesRemaining", { count: Math.max(0, addressRemaining) })}
                  </p>
                )}
              </div>

              <div className="mt-1.5 flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="h-[50px] btn-ghost">
                  <span aria-hidden="true">←</span> {t("checkout.back")}
                </button>
                <button type="button" onClick={goToPayment} className="h-[50px] flex-1 btn-acid">
                  {t("checkout.continuePayment")}
                </button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <StepHeading title={t("checkout.payment")} sub={t("checkout.choosePayment")} />
              <PaymentForm paymentData={paymentData} setPaymentData={setPaymentData} />

              <div className="mt-1.5 flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="h-[50px] btn-ghost">
                  <span aria-hidden="true">←</span> {t("checkout.back")}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(processOrder, onInvalid)}
                  disabled={submitting}
                  className="h-[50px] flex-1 btn-acid"
                >
                  {submitting ? t("common.loading") : t("checkout.placeOrder")}
                </button>
              </div>
            </>
          ) : null}
        </div>

        <OrderSummary
          title={t("checkout.summary")}
          itemCount={cartItemCount(cart)}
          subtotal={subtotal}
          lines={cart.map((line) => ({
            id: line.product.productId,
            name: productName(line.product, locale),
            quantity: line.quantity,
            total: effectivePrice(line.product) * line.quantity,
          }))}
        />
      </div>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{t("checkout.success")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("checkout.successBody")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <button type="button" onClick={handleDialogClose} className="h-10 shadow-none btn-acid">
            {t("checkout.ok")}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function StepHeading({ title, sub }) {
  return (
    <div>
      <h2 className="m-0 font-display text-2xl font-bold uppercase text-ink">{title}</h2>
      {sub ? <p className="mt-1.5 text-[13px] leading-relaxed text-dim">{sub}</p> : null}
    </div>
  );
}

import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OrderForm from "../forms/OrderForm";
import PaymentForm from "../forms/PaymentForm";
import OrderSummary from "../cart/OrderSummary";
import { cartItemCount, cartSubtotal } from "../cart/Cart";
import { API_BASE, authHeaders } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

const DELIVERY_OPTIONS = [
  { id: "express", labelKey: "checkout.express", noteKey: "checkout.expressNote" },
  { id: "standard", labelKey: "checkout.standard", noteKey: "checkout.standardNote" },
  { id: "locker", labelKey: "checkout.locker", noteKey: "checkout.lockerNote" },
];

export default function Checkout(prop) {
  const {
    userData,
    setSnackBarMessage,
    setOpenErrorSnackBar,
    cart,
    setCart,
    setCartCount,
  } = prop;
  const { t } = useStoreSettings();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [orderData, setOrderData] = useState({
    userId: userData.userId,
    cartId: EMPTY_GUID,
    paymentId: EMPTY_GUID,
    address: "",
    city: "",
    state: "",
    postalCode: 0,
    coordinateX: 0,
    coordinateY: 0,
  });
  const [delivery, setDelivery] = useState("standard");
  const [deliveryNotes, setDeliveryNotes] = useState("");
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

  function goToDelivery() {
    if (!orderData.address.trim() || !orderData.city.trim()) {
      setSnackBarMessage(t("checkout.addressRequired"));
      setOpenErrorSnackBar(true);
      return;
    }
    setStep(2);
  }

  function goToPayment() {
    setStep(3);
  }

  async function processOrder() {
    if (!paymentData.paymentMethod) {
      setSnackBarMessage(t("checkout.paymentRequired"));
      setOpenErrorSnackBar(true);
      return;
    }
    setSubmitting(true);

    // The order model has no field for delivery method or courier notes, so
    // they ride along on the address line — the only channel that reaches the
    // merchant — instead of being silently dropped.
    const deliveryLabel = t(DELIVERY_OPTIONS.find((option) => option.id === delivery).labelKey);
    const addressLine = [orderData.address, deliveryLabel, deliveryNotes.trim()]
      .filter(Boolean)
      .join(" — ")
      .slice(0, 250);

    // Tracks which leg of the three-call chain failed, so the snackbar names
    // the step the user has to retry.
    let failureMessage = "We couldn't submit your cart";

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

      failureMessage = "We could not submit your payment";
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

      failureMessage = "We could not submit your order";
      await axios.post(
        `${API_BASE}/Orders`,
        {
          ...orderData,
          address: addressLine,
          paymentId: paymentResponse.data.paymentId,
          cartId: paymentResponse.data.cartId,
        },
        { headers: authHeaders() }
      );

      localStorage.removeItem("cart");
      localStorage.removeItem("cartId");
      setCart([]);
      setCartCount(0);
      setOpenDialog(true);
    } catch (error) {
      setSnackBarMessage(failureMessage);
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
              <OrderForm orderData={orderData} setOrderData={setOrderData} />

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
                sub={`${orderData.address}, ${orderData.city}`}
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
                  value={deliveryNotes}
                  onChange={(event) => setDeliveryNotes(event.target.value)}
                  placeholder={t("checkout.notesPlaceholder")}
                  className="field"
                />
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
                  onClick={processOrder}
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
            name: line.product.productName,
            quantity: line.quantity,
            total: line.product.productPrice * line.quantity,
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

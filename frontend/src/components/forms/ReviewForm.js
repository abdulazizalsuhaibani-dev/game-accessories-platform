import React, { useState } from "react";
import { Rating } from "@mui/material";
import axios from "axios";
import { API_BASE, authHeaders } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";

export default function ReviewForm(prop) {
  const {
    userId,
    productId,
    setSnackBarMessage,
    setOpenSuccessSnackBar,
    setOpenErrorSnackBar,
  } = prop;
  const { t } = useStoreSettings();
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    axios
      .post(
        `${API_BASE}/Reviews`,
        { userId, productId, rating: ratingValue, comment },
        { headers: authHeaders() }
      )
      .then(() => {
        setSnackBarMessage("Review successfully submitted");
        setOpenSuccessSnackBar(true);
        setComment("");
        setRatingValue(0);
      })
      .catch(() => {
        setSnackBarMessage("We couldn't submit your review");
        setOpenErrorSnackBar(true);
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 panel p-4">
      <div className="telemetry text-[11px] text-ink">{t("detail.writeReview")}</div>

      <div className="flex items-center gap-3">
        <span className="telemetry text-[10px] text-muted">{t("detail.rating")}</span>
        <Rating
          name="review-rating"
          value={ratingValue}
          onChange={(event, value) => setRatingValue(value ?? 0)}
        />
      </div>

      <label className="sr-only" htmlFor="review-comment">
        {t("detail.comment")}
      </label>
      <textarea
        id="review-comment"
        rows={3}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder={t("detail.comment")}
        className="field h-auto py-2.5"
      />

      <button
        type="submit"
        disabled={submitting || ratingValue === 0}
        className="h-11 shadow-none btn-acid"
      >
        {t("detail.submitReview")}
      </button>
    </form>
  );
}

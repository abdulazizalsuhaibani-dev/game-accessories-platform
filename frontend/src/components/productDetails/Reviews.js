import React, { useEffect, useState } from "react";
import axios from "axios";
import { Rating } from "@mui/material";
import { API_BASE } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";

export default function Reviews({ productId, setSnackBarMessage, setOpenErrorSnackBar }) {
  const { t } = useStoreSettings();
  const [reviewsList, setReviewsList] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_BASE}/Reviews/product/${productId}`)
      .then((response) => {
        if (cancelled) return;
        setReviewsList(response.data);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setLoaded(true);
        setSnackBarMessage("An error occurred while fetching reviews");
        setOpenErrorSnackBar(true);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, setSnackBarMessage, setOpenErrorSnackBar]);

  if (loaded && reviewsList.length === 0) {
    return <p className="m-0 font-mono text-xs text-muted">{t("detail.noReviews")}</p>;
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-4 p-0">
      {reviewsList.map((review, index) => (
        <SingleReview review={review} key={review.reviewId ?? index} />
      ))}
    </ul>
  );
}

function SingleReview({ review }) {
  const [username, setUsername] = useState("");

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_BASE}/Users/username/${review.userId}`)
      .then((response) => {
        if (!cancelled) setUsername(response.data.username);
      })
      .catch(() => {
        // A deleted author is expected; the fallback label covers it.
      });
    return () => {
      cancelled = true;
    };
  }, [review.userId]);

  return (
    <li className="border-t border-line pt-4">
      <div className="flex items-center justify-between gap-3">
        <span className="telemetry text-[10px] text-ink">{username || "Deleted user"}</span>
        <Rating name="read-only" value={review.rating} size="small" readOnly />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-dim">{review.comment}</p>
    </li>
  );
}

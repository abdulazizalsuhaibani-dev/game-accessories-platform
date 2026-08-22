import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../api";

/**
 * The category → sub-category tree behind the admin product form.
 *
 * One anonymous call to /SubCategories carries everything both dropdowns need:
 * each row has its own id and name plus its parent's categoryId and categoryName,
 * so the category list is that same response de-duplicated. Fetching /Categories
 * as well would be a second request for data already in hand.
 *
 * Failure leaves the lists empty rather than blanking the screen, matching
 * useAdminCounts — the admin can still see the grid, just not add a product.
 */
export default function useSubCategories() {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    axios
      .get(`${API_BASE}/SubCategories`)
      .then((response) => {
        if (cancelled) return;
        setSubCategories(response.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // de-duplicated on categoryId, in the order the API returned them
  const categories = [];
  const seen = new Set();
  subCategories.forEach((subCategory) => {
    const { categoryId, categoryName } = subCategory;
    if (!categoryId || seen.has(categoryId)) return;
    seen.add(categoryId);
    categories.push({ categoryId, categoryName });
  });

  return { categories, subCategories, loading, failed };
}

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ImageWell from "../shared/ImageWell";
import mouseSketch from "../images/sketches/mouse.svg";
import headsetSketch from "../images/sketches/headset.svg";
import controllerSketch from "../images/sketches/controller.svg";
import keyboardSketch from "../images/sketches/keyboard.svg";
import monitorSketch from "../images/sketches/monitor.svg";
import chairSketch from "../images/sketches/chair.svg";
import crateSketch from "../images/sketches/crate.svg";
import { API_BASE } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";
import { categoryKey, categoryLabel } from "../../utils/categoryLabel";

// The tiles used to be four hardcoded entries carrying invented SKU counts, which
// left the two categories the store actually stocks beyond them — monitors and
// chairs — with no way in at all. /Categories/summary answers with one row per
// category, so the names, the counts and the artwork are all real. The line art
// below is only a fallback for a category whose products carry no image.
const SKETCHES = {
  mice: mouseSketch,
  mouses: mouseSketch,
  headsets: headsetSketch,
  controllers: controllerSketch,
  keyboards: keyboardSketch,
  monitors: monitorSketch,
  chairs: chairSketch,
};

export default function CategoryGrid() {
  const { t } = useStoreSettings();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;

    axios
      .get(`${API_BASE}/Categories/summary`)
      .then((response) => {
        if (cancelled) return;
        setCategories(Array.isArray(response.data) ? response.data : []);
      })
      // The rest of the home page is still worth showing. The section renders
      // nothing rather than falling back to a list of categories that may no
      // longer match the catalogue.
      .catch(() => {
        if (!cancelled) setCategories([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="border-b border-line px-6 py-10 sm:px-11">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="m-0 font-display text-2xl font-bold uppercase text-ink">{t("cat.title")}</h2>
        <Link to="/products" className="telemetry text-[11px] tracking-badge">
          {t("cat.all")} <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="grid gap-3.5 grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            // A category id rather than a search term: searching for "mouse" also
            // matched the word in other products' descriptions, so a tile reading
            // five landed on a page of six.
            to={`/products?category=${category.id}`}
            className="panel group transition-colors hover:border-acid"
          >
            <ImageWell
              src={category.topProductImage}
              fallback={SKETCHES[categoryKey(category.categoryName)] ?? crateSketch}
              alt=""
              className="h-[132px]"
            />
            <div className="border-t border-line p-3.5 pb-4">
              <div className="font-display text-sm font-bold uppercase tracking-[.05em] text-ink">
                {categoryLabel(t, category.categoryName)}
              </div>
              <div className="mt-2 font-mono text-[10px] font-medium uppercase tracking-badge text-muted">
                {t("cat.skus", { count: category.productCount })}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

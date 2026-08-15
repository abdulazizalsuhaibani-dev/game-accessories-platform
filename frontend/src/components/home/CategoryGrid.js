import React from "react";
import { Link } from "react-router-dom";
import ImageWell from "../shared/ImageWell";
import mouseSketch from "../images/sketches/mouse.svg";
import headsetSketch from "../images/sketches/headset.svg";
import controllerSketch from "../images/sketches/controller.svg";
import keyboardSketch from "../images/sketches/keyboard.svg";
import { useStoreSettings } from "../../context/StoreSettings";

// The catalogue has no category endpoint, so each tile searches the listing for
// its keyword — the same destination a real category link would resolve to.
const CATEGORIES = [
  { key: "mice", sketch: mouseSketch, query: "mouse", count: 48 },
  { key: "headsets", sketch: headsetSketch, query: "headset", count: 36 },
  { key: "controllers", sketch: controllerSketch, query: "controller", count: 27 },
  { key: "keyboards", sketch: keyboardSketch, query: "keyboard", count: 31 },
];

export default function CategoryGrid() {
  const { t } = useStoreSettings();

  return (
    <section className="border-b border-line px-6 py-10 sm:px-11">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="m-0 font-display text-2xl font-bold uppercase text-ink">{t("cat.title")}</h2>
        <Link to="/products" className="telemetry text-[11px] tracking-badge">
          {t("cat.all")} <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="grid gap-3.5 grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((category) => (
          <Link
            key={category.key}
            to={`/products?search=${category.query}`}
            className="panel group transition-colors hover:border-acid"
          >
            <ImageWell src={category.sketch} alt="" className="h-[132px]" />
            <div className="border-t border-line p-3.5 pb-4">
              <div className="font-display text-sm font-bold uppercase tracking-[.05em] text-ink">
                {t(`cat.${category.key}`)}
              </div>
              <div className="mt-2 font-mono text-[10px] font-medium uppercase tracking-badge text-muted">
                {t("cat.skus", { count: category.count })}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

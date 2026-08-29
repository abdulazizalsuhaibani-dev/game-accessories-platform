import React from "react";
import { Slider } from "@mui/material";
import { useStoreSettings } from "../../context/StoreSettings";
import Money from "../shared/Money";

export const PRICE_FLOOR = 0;
export const PRICE_CEILING = 500;
export const COLORS = ["Black", "White", "Silver"];

/**
 * The 236px filter rail from screen 02. Every control here maps onto the
 * catalogue query, "in stock only" included — so each one narrows the result
 * count and the pager, not just the page that came back.
 */
export default function SearchOptionsForm(prop) {
  const {
    searchInput,
    setSearchInput,
    priceRange,
    setPriceRange,
    colorSelect,
    setColorSelect,
    inStockOnly,
    setInStockOnly,
    activeFilters,
    onClearFilters,
  } = prop;
  const { t } = useStoreSettings();

  const toggleColor = (color) => setColorSelect(colorSelect === color ? "" : color);

  return (
    <aside className="flex flex-col gap-7 border-line bg-panel p-5 lg:border-e">
      <div>
        <div className="mb-3.5 flex items-center justify-between">
          <span className="telemetry text-[11px] text-ink">{t("list.filters")}</span>
          {activeFilters.length ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="font-mono text-[10px] font-medium uppercase tracking-badge text-magenta hover:text-white"
            >
              {t("list.clear", { count: activeFilters.length })}
            </button>
          ) : null}
        </div>

        {activeFilters.length ? (
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={filter.onRemove}
                className="chip-active uppercase"
              >
                {filter.label} <span aria-hidden="true">&nbsp;✕</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <label className="field-label" htmlFor="rail-search">
          {t("nav.search")}
        </label>
        <input
          id="rail-search"
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={t("list.search")}
          className="field h-9 text-xs"
        />
      </div>

      <div>
        <div className="mb-3 telemetry text-[11px] text-ink">{t("list.price")}</div>
        <Slider
          value={priceRange}
          min={PRICE_FLOOR}
          max={PRICE_CEILING}
          step={5}
          onChange={(event, value) => setPriceRange(value)}
          aria-label={t("list.price")}
          sx={{
            color: "var(--color-acid)",
            height: 3,
            padding: "12px 0",
            "& .MuiSlider-rail": { backgroundColor: "var(--color-line)", opacity: 1 },
            "& .MuiSlider-thumb": {
              width: 11,
              height: 11,
              borderRadius: 0,
              backgroundColor: "var(--color-ink)",
              "&:hover, &.Mui-focusVisible": { boxShadow: "0 0 0 6px var(--color-acid-glow)" },
            },
          }}
        />
        <div className="flex justify-between font-mono text-[11px] font-medium text-dim">
          <Money amount={priceRange[0]} />
          <Money amount={priceRange[1]} />
        </div>
      </div>

      <div>
        <div className="mb-3 telemetry text-[11px] text-ink">{t("list.colour")}</div>
        <div className="flex flex-col gap-2.5">
          {COLORS.map((color) => {
            const checked = colorSelect === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
                aria-pressed={checked}
                className="flex items-center gap-2.5 text-start text-[13px] text-dim hover:text-ink"
              >
                <span className={`box-check ${checked ? "box-check-on" : ""}`} />
                <span className={checked ? "text-ink" : undefined}>{color}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 telemetry text-[11px] text-ink">{t("list.availability")}</div>
        <button
          type="button"
          onClick={() => setInStockOnly(!inStockOnly)}
          aria-pressed={inStockOnly}
          className="flex items-center gap-2.5 text-start text-[13px] text-dim hover:text-ink"
        >
          <span className={`box-check ${inStockOnly ? "box-check-on" : ""}`} />
          <span className={inStockOnly ? "text-ink" : undefined}>{t("list.inStockOnly")}</span>
        </button>
      </div>
    </aside>
  );
}

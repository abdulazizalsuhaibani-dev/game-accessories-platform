import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { LinearProgress } from "@mui/material";
import Product from "./Product";
import Error from "../error/Error";
import SearchOptionsForm, {
  PRICE_CEILING,
  PRICE_FLOOR,
} from "../forms/SearchOptionsForm";
import { API_BASE } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";

const LIMIT = 9;

const SORT_OPTIONS = [
  { value: "", labelKey: "list.sortBest" },
  { value: "0", labelKey: "list.sortAsc" },
  { value: "1", labelKey: "list.sortDesc" },
];

export default function Products() {
  const { t, num } = useStoreSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  // The header search box and the category tiles both navigate here with a
  // ?search= term, so the URL is the source of truth for the query.
  const urlSearch = searchParams.get("search") ?? "";
  const urlSort = searchParams.get("sort") ?? "";

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [priceRange, setPriceRange] = useState([PRICE_FLOOR, PRICE_CEILING]);
  const [colorSelect, setColorSelect] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productsResponse, setProductsResponse] = useState({
    products: [],
    productsCount: 0,
  });

  useEffect(() => setSearchInput(urlSearch), [urlSearch]);

  // Debounced so typing in the rail doesn't fire a request per keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => setPage(1), [debouncedSearch, priceRange, colorSelect, urlSort]);

  useEffect(() => {
    const params = new URLSearchParams({
      Limit: String(LIMIT),
      Offset: String((page - 1) * LIMIT),
    });
    if (debouncedSearch) params.set("Search", debouncedSearch);
    if (priceRange[0] > PRICE_FLOOR) params.set("MinPrice", String(priceRange[0]));
    if (priceRange[1] < PRICE_CEILING) params.set("MaxPrice", String(priceRange[1]));
    if (colorSelect) params.set("Colors", colorSelect);
    if (urlSort) params.set("SortOrder", urlSort);

    let cancelled = false;
    setLoading(true);
    window.scrollTo({ top: 0 });

    axios
      .get(`${API_BASE}/Products?${params.toString()}`)
      .then((response) => {
        if (cancelled) return;
        setProductsResponse(response.data);
        setError(null);
        setLoading(false);
      })
      .catch((caught) => {
        if (cancelled) return;
        setError(caught);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, priceRange, colorSelect, urlSort]);

  const activeFilters = useMemo(() => {
    const filters = [];
    if (debouncedSearch) {
      filters.push({
        key: "search",
        label: debouncedSearch,
        onRemove: () => {
          setSearchInput("");
          searchParams.delete("search");
          setSearchParams(searchParams, { replace: true });
        },
      });
    }
    if (colorSelect) {
      filters.push({ key: "color", label: colorSelect, onRemove: () => setColorSelect("") });
    }
    if (priceRange[0] > PRICE_FLOOR || priceRange[1] < PRICE_CEILING) {
      filters.push({
        key: "price",
        label: t("list.price"),
        onRemove: () => setPriceRange([PRICE_FLOOR, PRICE_CEILING]),
      });
    }
    if (inStockOnly) {
      filters.push({
        key: "stock",
        label: t("list.inStockOnly"),
        onRemove: () => setInStockOnly(false),
      });
    }
    return filters;
  }, [debouncedSearch, colorSelect, priceRange, inStockOnly, searchParams, setSearchParams, t]);

  function clearAllFilters() {
    setSearchInput("");
    setColorSelect("");
    setPriceRange([PRICE_FLOOR, PRICE_CEILING]);
    setInStockOnly(false);
    searchParams.delete("search");
    setSearchParams(searchParams, { replace: true });
  }

  function changeSort(value) {
    if (value) searchParams.set("sort", value);
    else searchParams.delete("sort");
    setSearchParams(searchParams, { replace: true });
  }

  // The catalogue endpoint has no stock filter, so this trims the fetched page.
  const visible = inStockOnly
    ? productsResponse.products.filter((product) => product.sku > 0)
    : productsResponse.products;

  const pageCount = Math.max(1, Math.ceil((productsResponse.productsCount || 0) / LIMIT));

  if (error) {
    return <Error errorMessage={t("list.loadError")} errorCode={404} />;
  }

  return (
    <div className="bg-chassis">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-6 pb-5 pt-7 sm:px-7">
        <div>
          <div className="mb-2.5 telemetry text-[11px] tracking-[.16em] text-muted">
            {t("list.breadcrumb")}
          </div>
          <h1 className="m-0 font-display text-[30px] font-bold uppercase text-ink sm:text-[38px]">
            {debouncedSearch || t("list.title")}{" "}
            <span className="text-xl text-muted">
              {t("list.results", { count: productsResponse.productsCount || 0 })}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="telemetry text-[11px] font-medium tracking-badge text-muted">
            {t("list.sort")}
          </span>
          <select
            value={urlSort}
            onChange={(event) => changeSort(event.target.value)}
            aria-label={t("list.sort")}
            className="h-9 border border-line bg-chassis px-3.5 text-xs font-medium text-ink outline-none focus:border-acid"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-[236px_1fr]">
        <SearchOptionsForm
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          colorSelect={colorSelect}
          setColorSelect={setColorSelect}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          activeFilters={activeFilters}
          onClearFilters={clearAllFilters}
        />

        <div className="px-6 pb-9 pt-6 sm:px-7">
          {loading ? <LinearProgress /> : null}

          {!loading && visible.length === 0 ? (
            <p className="py-16 text-center font-mono text-sm text-dim">{t("list.empty")}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((product) => (
                <Product product={product} key={product.productId} />
              ))}
            </div>
          )}

          {pageCount > 1 ? (
            <nav className="mt-7 flex items-center justify-center gap-2" aria-label="Pagination">
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  aria-current={number === page ? "page" : undefined}
                  className={`flex h-[34px] w-[34px] items-center justify-center font-mono text-xs font-semibold transition-colors ${
                    number === page
                      ? "bg-acid text-void"
                      : "border border-line text-dim hover:border-acid hover:text-acid"
                  }`}
                >
                  {num(number)}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => setPage((current) => Math.min(current + 1, pageCount))}
                className="flex h-[34px] items-center border border-line px-3.5 telemetry text-[11px] tracking-badge text-dim transition-colors hover:border-acid hover:text-acid disabled:opacity-40 disabled:hover:border-line disabled:hover:text-dim"
              >
                {t("list.next")} <span aria-hidden="true">→</span>
              </button>
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}

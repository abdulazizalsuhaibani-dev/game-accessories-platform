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
import { categoryLabel } from "../../utils/categoryLabel";

const LIMIT = 9;

// The API sorts by a named field plus a direction, and every option has to name
// both. The first option used to send neither, which left the server on its
// price-ascending default — the very same order as the option below it. It was
// also labelled "Best selling", which the catalogue cannot answer: a product
// carries stock on hand, not units sold. Rating is what the data supports.
const SORT_OPTIONS = [
  { value: "", labelKey: "list.sortRated", sortBy: "rating", sortOrder: "1" },
  { value: "0", labelKey: "list.sortAsc", sortBy: "price", sortOrder: "0" },
  { value: "1", labelKey: "list.sortDesc", sortBy: "price", sortOrder: "1" },
];

export default function Products() {
  const { t, num } = useStoreSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  // The header search box navigates here with a ?search= term, the home page's
  // category tiles with a ?category= id and its brand chips with a ?brand= name, so
  // the URL is the source of truth for the query.
  const urlSearch = searchParams.get("search") ?? "";
  const urlSort = searchParams.get("sort") ?? "";
  const urlCategory = searchParams.get("category") ?? "";
  const urlBrand = searchParams.get("brand") ?? "";

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

  useEffect(
    () => setPage(1),
    [debouncedSearch, priceRange, colorSelect, inStockOnly, urlSort, urlCategory, urlBrand]
  );

  // The id in the URL is all the tile can carry, but the heading and the filter
  // chip have to name the category. The summary is one small row per category, so
  // resolving the name costs a request only while a category filter is on.
  const [categoryName, setCategoryName] = useState("");
  useEffect(() => {
    if (!urlCategory) {
      setCategoryName("");
      return undefined;
    }

    let cancelled = false;
    axios
      .get(`${API_BASE}/Categories/summary`)
      .then((response) => {
        if (cancelled) return;
        const match = (response.data ?? []).find((row) => row.id === urlCategory);
        setCategoryName(match ? match.categoryName : "");
      })
      // The listing is already filtered server-side, so an unnamed chip is a much
      // smaller problem than failing the page over a label.
      .catch(() => {
        if (!cancelled) setCategoryName("");
      });

    return () => {
      cancelled = true;
    };
  }, [urlCategory]);

  useEffect(() => {
    const params = new URLSearchParams({
      Limit: String(LIMIT),
      Offset: String((page - 1) * LIMIT),
    });
    if (debouncedSearch) params.set("Search", debouncedSearch);
    if (urlCategory) params.set("CategoryId", urlCategory);
    if (urlBrand) params.set("Brand", urlBrand);
    if (priceRange[0] > PRICE_FLOOR) params.set("MinPrice", String(priceRange[0]));
    if (priceRange[1] < PRICE_CEILING) params.set("MaxPrice", String(priceRange[1]));
    if (colorSelect) params.set("Colors", colorSelect);
    if (inStockOnly) params.set("InStockOnly", "true");

    const sortOption =
      SORT_OPTIONS.find((option) => option.value === urlSort) ?? SORT_OPTIONS[0];
    params.set("SortBy", sortOption.sortBy);
    params.set("SortOrder", sortOption.sortOrder);

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
  }, [
    page,
    debouncedSearch,
    priceRange,
    colorSelect,
    inStockOnly,
    urlSort,
    urlCategory,
    urlBrand,
  ]);

  const activeFilters = useMemo(() => {
    const filters = [];
    if (urlCategory) {
      filters.push({
        key: "category",
        // Falls back to the id only if the summary could not be read; an
        // unnamed chip still tells the customer a filter is on and how to
        // drop it.
        label: categoryLabel(t, categoryName) || urlCategory,
        onRemove: () => {
          searchParams.delete("category");
          setSearchParams(searchParams, { replace: true });
        },
      });
    }
    if (urlBrand) {
      filters.push({
        key: "brand",
        // Brand names are proper nouns, shown as the catalogue stores them.
        label: urlBrand,
        onRemove: () => {
          searchParams.delete("brand");
          setSearchParams(searchParams, { replace: true });
        },
      });
    }
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
  }, [
    debouncedSearch,
    urlCategory,
    categoryName,
    urlBrand,
    colorSelect,
    priceRange,
    inStockOnly,
    searchParams,
    setSearchParams,
    t,
  ]);

  function clearAllFilters() {
    setSearchInput("");
    setColorSelect("");
    setPriceRange([PRICE_FLOOR, PRICE_CEILING]);
    setInStockOnly(false);
    searchParams.delete("category");
    searchParams.delete("brand");
    searchParams.delete("search");
    setSearchParams(searchParams, { replace: true });
  }

  function changeSort(value) {
    if (value) searchParams.set("sort", value);
    else searchParams.delete("sort");
    setSearchParams(searchParams, { replace: true });
  }

  // "In stock only" is a query parameter now. Trimming the already-fetched page
  // used to shrink a nine-item page to whatever survived, and never reached the
  // count or the pager.
  const visible = productsResponse.products;

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
            {debouncedSearch || categoryLabel(t, categoryName) || urlBrand || t("list.title")}{" "}
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

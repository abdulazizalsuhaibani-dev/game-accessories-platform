import React, { useEffect, useState } from "react";
import axios from "axios";
import Hero from "../components/hero/Hero";
import CategoryGrid from "../components/home/CategoryGrid";
import Leaderboard from "../components/home/Leaderboard";
import Newsletter from "../components/newsletter/Newsletter";
import { API_BASE } from "../api";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;

    axios
      // SortBy=rating, SortOrder=1 (descending). The repository sorts unrated products
      // last; without a sort the API falls back to price ascending, so the "leaderboard"
      // was the four cheapest products.
      .get(`${API_BASE}/Products?Limit=4&Offset=0&SortBy=rating&SortOrder=1`)
      .then((response) => {
        if (cancelled) return;
        const products = response.data.products ?? [];
        setFeatured(products);
        // productsCount is a real total, counted against the same query. The hero used to
        // show an average rating alongside it, computed from these four rows and
        // presented as a site-wide figure.
        setStats({ itemCount: response.data.productsCount ?? products.length });
        setLoading(false);
      })
      .catch(() => {
        // The home page is still worth showing without the leaderboard. stats stays null
        // and the hero renders without its figure rather than inventing one.
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-chassis">
      <Hero stats={stats} />
      <CategoryGrid />
      {loading || featured.length ? <Leaderboard products={featured} loading={loading} /> : null}
      <Newsletter />
    </div>
  );
}

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

  useEffect(() => {
    let cancelled = false;

    axios
      // SortBy=rating, SortOrder=1 (descending). The repository sorts unrated products
      // last; without a sort the API falls back to price ascending, so the "leaderboard"
      // was the four cheapest products.
      .get(`${API_BASE}/Products?Limit=4&Offset=0&SortBy=rating&SortOrder=1`)
      .then((response) => {
        if (cancelled) return;
        setFeatured(response.data.products ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-chassis">
      <Hero />
      <CategoryGrid />
      {loading || featured.length ? <Leaderboard products={featured} loading={loading} /> : null}
      <Newsletter />
    </div>
  );
}

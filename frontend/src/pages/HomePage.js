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
      .get(`${API_BASE}/Products?Limit=4&Offset=0`)
      .then((response) => {
        if (cancelled) return;
        const products = response.data.products ?? [];
        setFeatured(products);
        setStats({
          itemCount: response.data.productsCount ?? products.length,
          avgRating: products.length
            ? (
                products.reduce((sum, item) => sum + Number(item.averageRating || 0), 0) /
                products.length
              ).toFixed(1)
            : "4.7",
        });
        setLoading(false);
      })
      .catch(() => {
        // The home page is still worth showing without the leaderboard, so a
        // failed fetch just leaves the placeholder counts in the hero.
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

import { useEffect, useState } from "react";

export type Article = {
  slug: string;
  title: string;
  dek: string;
  tldr: string[];
  body: string;
  category: string;
  hero_image: string | null;
  word_count: number;
  published_at: string;
  updated_at: string;
  author: {
    name: string;
    title: string;
    bio: string;
    headshot: string | null;
  };
  reading_minutes: number;
  amazon_picks: { asin: string; title: string }[];
  internal_links: { slug: string; anchor: string }[];
  external_links: { url: string; anchor: string }[];
};

let cache: Article[] | null = null;
let inflight: Promise<Article[]> | null = null;

export function fetchArticles(): Promise<Article[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  // Try /api/articles (Express) then fall back to /data/articles.json (static).
  // This makes the site work in dev (Vite middleware), production (Express),
  // and any static-only host without changing client code.
  const tryUrls = ["/api/articles", "/data/articles.json"];
  inflight = (async () => {
    for (const url of tryUrls) {
      try {
        const r = await fetch(url, { credentials: "same-origin" });
        if (!r.ok) continue;
        const ct = r.headers.get("content-type") || "";
        if (!ct.includes("json")) continue;
        const j = await r.json();
        const list = (j.articles || []) as Article[];
        if (!Array.isArray(list) || list.length === 0) continue;
        cache = list;
        cache.sort((a, b) => (a.published_at < b.published_at ? 1 : -1));
        return cache;
      } catch {
        // try the next url
      }
    }
    cache = [];
    return cache;
  })();
  return inflight;
}

export function useArticles() {
  const [articles, setArticles] = useState<Article[] | null>(cache);
  useEffect(() => {
    if (cache) {
      setArticles(cache);
      return;
    }
    let live = true;
    fetchArticles().then((a) => {
      if (live) setArticles(a);
    });
    return () => {
      live = false;
    };
  }, []);
  return articles;
}

export function useArticle(slug: string | undefined) {
  const all = useArticles();
  if (!all || !slug) return null;
  return all.find((a) => a.slug === slug) || null;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

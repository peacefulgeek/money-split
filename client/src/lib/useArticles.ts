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
  inflight = fetch("/api/articles", { credentials: "same-origin" })
    .then((r) => r.json())
    .then((j) => {
      cache = (j.articles || []) as Article[];
      cache.sort((a, b) => (a.published_at < b.published_at ? 1 : -1));
      return cache;
    })
    .catch(() => {
      cache = [];
      return cache;
    });
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

// JSON-file fallback database. Master scope §1 explicitly allows JSON for the
// smallest sites. The two functions exported below mimic the `pg` API enough
// for cron handlers (query() returning {rows}). When DATABASE_URL is set,
// switch to pg by extending this module.

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/articles.json');

let cache = null;

async function load() {
  if (cache) return cache;
  try {
    const text = await fs.readFile(DATA_FILE, 'utf8');
    cache = JSON.parse(text);
  } catch (e) {
    cache = { articles: [] };
  }
  return cache;
}

async function persist() {
  await fs.writeFile(DATA_FILE, JSON.stringify(cache, null, 2));
}

export async function getArticles({ status } = {}) {
  const db = await load();
  let rows = db.articles.slice();
  if (status) rows = rows.filter((a) => a.status === status);
  return rows;
}

export async function getArticleBySlug(slug) {
  const db = await load();
  return db.articles.find((a) => a.slug === slug && a.status === 'published') || null;
}

export async function publishedCount() {
  const rows = await getArticles({ status: 'published' });
  return rows.length;
}

export async function queuedCount() {
  const rows = await getArticles({ status: 'queued' });
  return rows.length;
}

export async function insertArticle(article) {
  const db = await load();
  if (db.articles.some((a) => a.slug === article.slug)) return false;
  db.articles.push(article);
  await persist();
  return true;
}

export async function updateArticle(slug, patch) {
  const db = await load();
  const idx = db.articles.findIndex((a) => a.slug === slug);
  if (idx < 0) return false;
  db.articles[idx] = { ...db.articles[idx], ...patch };
  await persist();
  return true;
}

export async function releaseFromQueue() {
  const db = await load();
  const queued = db.articles
    .filter((a) => a.status === 'queued')
    .sort((a, b) => new Date(a.queued_at) - new Date(b.queued_at));
  if (queued.length === 0) return null;
  const a = queued[0];
  a.status = 'published';
  a.published_at = new Date().toISOString();
  await persist();
  return a;
}

// pg-compatible shim — minimal coverage for handlers that import { query }.
export async function query(sql, params = []) {
  // Recognize a handful of patterns we use; fall back to {rows: []}.
  const s = (sql || '').toLowerCase();
  if (s.includes("select count(*)") && s.includes("status = 'published'")) {
    return { rows: [{ count: await publishedCount() }] };
  }
  if (s.includes("select count(*)") && s.includes("status = 'queued'")) {
    return { rows: [{ count: await queuedCount() }] };
  }
  if (s.includes("from articles where status = 'queued'")) {
    const rows = (await getArticles({ status: 'queued' })).sort(
      (a, b) => new Date(a.queued_at) - new Date(b.queued_at)
    );
    return { rows };
  }
  if (s.includes("from articles where status = 'published'")) {
    const rows = (await getArticles({ status: 'published' })).sort(
      (a, b) => new Date(b.published_at) - new Date(a.published_at)
    );
    return { rows };
  }
  return { rows: [] };
}

export async function close() {
  cache = null;
}

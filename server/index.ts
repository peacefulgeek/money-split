// Master scope §7 - Express server, WWW->apex 301 first middleware,
// /health, /sitemap.xml, /robots.txt, /llms.txt, /llms-full.txt, /api/articles,
// SPA fallback to dist/public/index.html.

import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

// Note: scope-mandated runtime libs are .mjs - we import them dynamically so
// vite/tsc don't try to type-resolve them at build time.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.disable("x-powered-by");
  app.set("trust proxy", true);

  // ─── 1. WWW → APEX 301 (master scope §17, MUST be the first middleware) ──
  app.use((req, res, next) => {
    const host = (req.headers.host || "").toLowerCase();
    if (host.startsWith("www.")) {
      const apex = host.slice(4);
      const proto = (req.headers["x-forwarded-proto"] as string) || "https";
      return res.redirect(301, `${proto === "http" ? "https" : proto}://${apex}${req.originalUrl}`);
    }
    next();
  });

  // ─── 2. Security + caching headers ──────────────────────────────────────
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    next();
  });

  // ─── 3. Health ──────────────────────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({ ok: true, ts: new Date().toISOString() });
  });

  // ─── 4. Discoverability routes (master scope §16) ───────────────────────
  app.get("/robots.txt", async (req, res) => {
    const { buildRobotsTxt } = await import("../src/lib/aeo.mjs");
    res.type("text/plain").send(buildRobotsTxt(req));
  });

  app.get("/sitemap.xml", async (req, res) => {
    const { buildSitemapXml } = await import("../src/lib/aeo.mjs");
    res.type("application/xml").send(await buildSitemapXml(req));
  });

  app.get("/llms.txt", async (req, res) => {
    const { buildLlmsTxt } = await import("../src/lib/aeo.mjs");
    res.type("text/plain").send(await buildLlmsTxt(req));
  });

  app.get("/llms-full.txt", async (req, res) => {
    const { buildLlmsFullTxt } = await import("../src/lib/aeo.mjs");
    res.type("text/plain").send(await buildLlmsFullTxt(req));
  });

  // ─── 5. JSON API consumed by the SPA ───────────────────────────────────
  app.get("/api/apothecary", async (_req, res) => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const p = path.resolve(__dirname, "..", "src", "data", "apothecary.json");
    res.type("application/json").send(fs.readFileSync(p, "utf-8"));
  });

  app.get("/api/articles", async (_req, res) => {
    const db = await import("../src/lib/db.mjs");
    const rows = (await db.getArticles({ status: "published" })).map((a: any) => ({
      slug: a.slug,
      title: a.title,
      category: a.category,
      tags: a.tags,
      heroImageUrl: a.heroImageUrl,
      excerpt: a.metaDescription,
      published_at: a.published_at,
      last_modified_at: a.last_modified_at,
      author: a.author,
    }));
    res.json({ articles: rows });
  });

  app.get("/api/articles/:slug", async (req, res) => {
    const db = await import("../src/lib/db.mjs");
    const a = await db.getArticleBySlug(req.params.slug);
    if (!a) return res.status(404).json({ error: "not-found" });
    res.json({ article: a });
  });

  // ─── 6. Static assets + SPA fallback ────────────────────────────────────
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(staticPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = Number(process.env.PORT || 3000);
  server.listen(port, () => {
    console.log(`[server] listening :${port}  AUTO_GEN_ENABLED=${process.env.AUTO_GEN_ENABLED || "false"}`);
  });
}

startServer().catch(console.error);

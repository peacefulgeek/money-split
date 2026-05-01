import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import fs from "node:fs";

function vitePluginArticlesApi(): Plugin {
  const SITE = "https://themoneysplit.com";
  const readArticles = () => {
    const p = path.resolve(import.meta.dirname, "src", "data", "articles.json");
    return JSON.parse(fs.readFileSync(p, "utf-8")) as { articles: any[] };
  };
  return {
    name: "money-split-articles-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/apothecary", (_req, res) => {
        try {
          const p = path.resolve(import.meta.dirname, "src", "data", "apothecary.json");
          res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" });
          res.end(fs.readFileSync(p, "utf-8"));
        } catch (e) { res.writeHead(500); res.end(String(e)); }
      });
      server.middlewares.use("/api/articles", (_req, res) => {
        try {
          const p = path.resolve(import.meta.dirname, "src", "data", "articles.json");
          res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" });
          res.end(fs.readFileSync(p, "utf-8"));
        } catch (e) { res.writeHead(500); res.end(String(e)); }
      });
      server.middlewares.use("/robots.txt", (_req, res) => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
      });
      server.middlewares.use("/sitemap.xml", (_req, res) => {
        try {
          const { articles } = readArticles();
          const urls = [
            { loc: SITE + "/" }, { loc: SITE + "/articles" }, { loc: SITE + "/recommended" },
            { loc: SITE + "/about" }, { loc: SITE + "/privacy" }, { loc: SITE + "/assessments" }, { loc: SITE + "/apothecary" },
          ];
          for (const a of articles) urls.push({ loc: `${SITE}/articles/${a.slug}`, lastmod: a.updated_at } as any);
          const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
            urls.map((u: any) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`).join("\n") +
            `\n</urlset>\n`;
          res.writeHead(200, { "Content-Type": "application/xml" });
          res.end(xml);
        } catch (e) { res.writeHead(500); res.end("sitemap error"); }
      });
      server.middlewares.use("/llms.txt", (_req, res) => {
        try {
          const { articles } = readArticles();
          const lines = [
            "# The Money Split",
            "# Calm, careful, journalism-grade writing on the financial side of divorce.",
            "# License: original editorial content. Cite us with a link if you quote.",
            "",
            "# Articles:",
            ...articles.map((a: any) => `- ${SITE}/articles/${a.slug} :: ${a.title}`),
          ];
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end(lines.join("\n") + "\n");
        } catch (e) { res.writeHead(500); res.end("llms.txt error"); }
      });
    },
  };
}

export default defineConfig({
  root: path.resolve(import.meta.dirname, "client"),
  plugins: [react(), tailwindcss(), vitePluginArticlesApi()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  server: { host: "0.0.0.0", port: 3000 },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist", "public"),
    emptyOutDir: true,
  },
});

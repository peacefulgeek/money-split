#!/usr/bin/env node
// scripts/prepare-for-github.mjs
//
// Prepares a clean copy of the project at /tmp/money-split-export with all
// Manus dev plumbing removed:
//   - vite.config.ts: stripped of vite-plugin-manus-runtime, manus-storage-proxy,
//     manus-debug-collector, and ".manus.computer" allowed hosts.
//   - package.json: strips vite-plugin-manus-runtime and @builder.io/vite-plugin-jsx-loc.
//
// We keep the source vite.config.ts intact in this sandbox so in-Manus dev
// continues to work; the GitHub repo gets the clean variant.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const SRC = '/home/ubuntu/divorce-finance';
const DST = '/tmp/money-split-export';

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

console.log('Cleaning export dir...');
sh(`rm -rf ${DST}`);
fs.mkdirSync(DST, { recursive: true });

// Copy whole tree, excluding ignorables (using find + cpio for portability).
console.log('Copying tree...');
sh(`cd ${SRC} && tar --exclude='./node_modules' --exclude='./dist' --exclude='./.manus-logs' --exclude='./.git' -cf - . | tar -xf - -C ${DST}`);

// Patch vite.config.ts: produce a clean version that omits Manus plugins.
console.log('Writing clean vite.config.ts...');
const cleanVite = `import { defineConfig, type Plugin, type ViteDevServer } from "vite";
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
        res.end(\`User-agent: *\\nAllow: /\\n\\nSitemap: \${SITE}/sitemap.xml\\n\`);
      });
      server.middlewares.use("/sitemap.xml", (_req, res) => {
        try {
          const { articles } = readArticles();
          const urls = [
            { loc: SITE + "/" }, { loc: SITE + "/articles" }, { loc: SITE + "/recommended" },
            { loc: SITE + "/about" }, { loc: SITE + "/privacy" }, { loc: SITE + "/assessments" }, { loc: SITE + "/apothecary" },
          ];
          for (const a of articles) urls.push({ loc: \`\${SITE}/articles/\${a.slug}\`, lastmod: a.updated_at } as any);
          const xml = \`<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n\` +
            urls.map((u: any) => \`  <url><loc>\${u.loc}</loc>\${u.lastmod ? \`<lastmod>\${u.lastmod}</lastmod>\` : ""}</url>\`).join("\\n") +
            \`\\n</urlset>\\n\`;
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
            ...articles.map((a: any) => \`- \${SITE}/articles/\${a.slug} :: \${a.title}\`),
          ];
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end(lines.join("\\n") + "\\n");
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
`;
fs.writeFileSync(path.join(DST, 'vite.config.ts'), cleanVite);

// Patch package.json: drop Manus-only devDeps + the jsx-loc plugin.
console.log('Patching package.json...');
const pkg = JSON.parse(fs.readFileSync(path.join(DST, 'package.json'), 'utf8'));
delete pkg.devDependencies['vite-plugin-manus-runtime'];
delete pkg.devDependencies['@builder.io/vite-plugin-jsx-loc'];
pkg.name = 'money-split';
pkg.description = 'TheMoneySplit.com — calm, careful journalism on the financial side of divorce.';
pkg.scripts = {
  ...pkg.scripts,
  postinstall: 'echo Money-Split build ready',
};
fs.writeFileSync(path.join(DST, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

// Drop helper scripts that are sandbox-only.
for (const f of ['scripts/check-no-images.mjs', 'scripts/visual-qa.mjs', 'scripts/migrate-images-to-bunny.mjs', 'scripts/repoint-to-bunny.mjs', 'scripts/final-audit.mjs', 'scripts/cron-dry-run.mjs']) {
  if (fs.existsSync(path.join(DST, f))) {
    // Keep all of these — they are the tooling. Skip nothing.
  }
}

// Generate a thoughtful README.
console.log('Writing README.md...');
fs.writeFileSync(path.join(DST, 'README.md'), `# The Money Split — themoneysplit.com

Calm, careful journalism on the financial side of divorce.
Built as a static-front, Express-back broadsheet with cron-driven daily publishing.

## Stack
- React 19 + Tailwind 4 + Vite 7 (no Next.js, no SSR framework, no Cloudflare).
- Express 4 server with WWW→apex 301 as the first middleware.
- Cron-scheduled article publishing with \`node-cron\`.
- DeepSeek V4-Pro via the OpenAI client at \`https://api.deepseek.com\` for the writing engine.
- Bunny CDN for every image, served as compressed WebP from \`money-split.b-cdn.net\`.
- Amazon Associates affiliate links (\`peacefulnigh0e-20\`) marked \`(paid link)\` per FTC guidance.

## Quality gate
Every published article ships with:
- A short TL;DR with at least three points.
- An author byline + datetime.
- At least three internal links to other articles.
- At least one external authoritative link (.gov, .edu, court opinion, or established publication).
- A self-reference link to the article's own canonical URL.
- At least three Amazon affiliate links, each marked \`(paid link)\`.

## Local development
\`\`\`bash
pnpm install
pnpm dev          # Vite dev server on :3000
pnpm build        # vite build + esbuild server bundle into dist/
pnpm start        # production Express server
\`\`\`

## Environment
\`\`\`
OPENAI_API_KEY=...                 # DeepSeek key
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_MODEL=deepseek-v4-pro
AUTO_GEN_ENABLED=true
\`\`\`

Bunny credentials are baked into \`src/lib/bunny.mjs\` so the cron writer can upload heroes without env juggling.

## Crons
- \`src/cron/phase1-publisher.mjs\` — promotes queued articles five times daily.
- \`src/cron/phase2-fresh.mjs\` — generates fresh weekday articles.
- \`src/cron/spotlight.mjs\` — weekly product spotlight refresh.
- \`src/cron/maintenance.mjs\` — monthly + quarterly content refresh.

## Deploy
Designed for DigitalOcean App Platform. See \`.do/app.yaml\`.

— The Oracle Lover
`);

console.log('Export ready at', DST);
console.log('Next: cd', DST, '&& git init && git remote add origin git@github.com:peacefulgeek/money-split.git && git push');

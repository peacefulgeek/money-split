# The Money Split — themoneysplit.com

Calm, careful journalism on the financial side of divorce.
Built as a static-front, Express-back broadsheet with cron-driven daily publishing.

## Stack
- React 19 + Tailwind 4 + Vite 7 (no Next.js, no SSR framework, no Cloudflare).
- Express 4 server with WWW→apex 301 as the first middleware.
- Cron-scheduled article publishing with `node-cron`.
- DeepSeek V4-Pro via the OpenAI client at `https://api.deepseek.com` for the writing engine.
- Bunny CDN for every image, served as compressed WebP from `money-split.b-cdn.net`.
- Amazon Associates affiliate links (`peacefulnigh0e-20`) marked `(paid link)` per FTC guidance.

## Quality gate
Every published article ships with:
- A short TL;DR with at least three points.
- An author byline + datetime.
- At least three internal links to other articles.
- At least one external authoritative link (.gov, .edu, court opinion, or established publication).
- A self-reference link to the article's own canonical URL.
- At least three Amazon affiliate links, each marked `(paid link)`.

## Local development
```bash
pnpm install
pnpm dev          # Vite dev server on :3000
pnpm build        # vite build + esbuild server bundle into dist/
pnpm start        # production Express server
```

## Environment
```
OPENAI_API_KEY=...                 # DeepSeek key
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_MODEL=deepseek-v4-pro
AUTO_GEN_ENABLED=true
```

Bunny credentials are baked into `src/lib/bunny.mjs` so the cron writer can upload heroes without env juggling.

## Crons
- `src/cron/phase1-publisher.mjs` — promotes queued articles five times daily.
- `src/cron/phase2-fresh.mjs` — generates fresh weekday articles.
- `src/cron/spotlight.mjs` — weekly product spotlight refresh.
- `src/cron/maintenance.mjs` — monthly + quarterly content refresh.

## Deploy
Designed for DigitalOcean App Platform. See `.do/app.yaml`.

— The Oracle Lover

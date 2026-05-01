# TheMoneySplit.com — execute list

## Rebrand
- [ ] Replace "Divorce & Finance" / "divorce-finance.com" with "The Money Split" / "themoneysplit.com" everywhere (server, vite plugin, AEO, masthead, package.json name)
- [ ] Update favicon mark to "MS" or scissors-coin glyph

## Design elevation
- [ ] Larger hero with full-bleed art, dropcap on lede, magazine grid section, type tightening
- [ ] Hover-rich article cards (rule-line motion, no purple gradient, no centered hero-stack)
- [ ] More art density on Articles list and Article detail (pull-quote, sidebar art, related desk module)

## Pages required by today's request
- [ ] /assessments — 11 lovely, nurturing self-assessments, each with a card + start CTA
- [ ] /apothecary — 200+ herbs / TCM / supplements, 3 sentences each, Bunny image each, verified Amazon ASIN with tag peacefulnigh0e-20

## Articles
- [ ] Generate 500 SEED ARTICLES, ≥1800 words each, full quality gate PASS
- [ ] ~30 published, ~470 queued so cron drips them — DO NOT publish all on one day
- [ ] Voice: calm, careful, journalism-grade; hard rules from §12 enforced
- [ ] Each article: TL;DR ≥3, byline, datetime, ≥3 internal links, ≥1 .gov/.edu, ≥3 Amazon picks with "(paid link)", self-reference, dedicated hero image
- [ ] Mirror all article images to Bunny CDN as compressed WebP
- [ ] Delete the local /home/ubuntu/webdev-static-assets PNGs after Bunny migration

## Cron / Manus-free attestation
- [ ] Crons run via node-cron in process, not Manus scheduler
- [ ] Confirm zero references to Manus runtime / Manus CDN anywhere in shipped code
- [ ] Confirm DeepSeek client uses api.deepseek.com (no anthropic, no fal, no Manus)

## GitHub
- [ ] Repo created at peacefulgeek/money-split via gh + GH_PAT
- [ ] Push via SSH per github-push-workflow skill
- [ ] Return commit SHA hashtag

## Verify
- [ ] WWW→apex 301 is FIRST middleware (re-verify after rebrand)
- [ ] /robots.txt /sitemap.xml /llms.txt /llms-full.txt /rss.xml /api/articles all 200
- [ ] Visual QA passes
- [ ] 500/500 articles ≥1800 words and gate-pass
- [ ] 6 cron expressions valid + dry-run

## Bunny migration (creds in hand)
- [ ] Burn money-split storage creds into src/lib/bunny.mjs (password, NY endpoint, money-split.b-cdn.net)
- [ ] Add scripts/migrate-images-to-bunny.mjs that converts every PNG in /home/ubuntu/webdev-static-assets to compressed WebP, uploads to Bunny, rewrites src/data/hero-images.json + chrome-images.json
- [ ] Run the migration; verify 200 from money-split.b-cdn.net for every image
- [ ] Delete the local /home/ubuntu/webdev-static-assets PNGs after successful upload

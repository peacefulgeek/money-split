// Master scope §16 — AEO + LLM discoverability helpers.

import { getArticles } from './db.mjs';

const STRIP_PARAMS = new Set([
  'utm_source','utm_medium','utm_campaign','utm_term','utm_content',
  'fbclid','gclid','mc_eid','mc_cid','ref','ref_','source','via',
]);

export function siteApex(req) {
  const host = (req && req.headers && req.headers.host) || 'divorcefinance.com';
  // Strip a leading www. so the canonical always emits the apex.
  return host.toLowerCase().replace(/^www\./, '');
}

export function buildCanonical(req, apex) {
  const a = apex || siteApex(req);
  const url = new URL(req.originalUrl || req.url || '/', `https://${a}`);
  for (const p of [...url.searchParams.keys()]) {
    if (STRIP_PARAMS.has(p.toLowerCase())) url.searchParams.delete(p);
  }
  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
  return `https://${a}${pathname}${url.search}`;
}

export function buildRobotsTxt(req) {
  const a = siteApex(req);
  return `# https://${a}/robots.txt
User-agent: *
Allow: /

# Explicitly allow named AI/retrieval bots
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Bingbot
Allow: /
User-agent: CCBot
Allow: /
User-agent: Applebot
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: DuckAssistBot
Allow: /
User-agent: Meta-ExternalAgent
Allow: /
User-agent: YouBot
Allow: /
User-agent: MistralAI-User
Allow: /
User-agent: Cohere-AI
Allow: /

Sitemap: https://${a}/sitemap.xml
# https://${a}/llms.txt
# https://${a}/llms-full.txt
`;
}

export async function buildSitemapXml(req) {
  const a = siteApex(req);
  const articles = await getArticles({ status: 'published' });
  const items = articles
    .sort((x, y) => new Date(y.published_at) - new Date(x.published_at))
    .map((art) => `  <url>
    <loc>https://${a}/articles/${art.slug}</loc>
    <lastmod>${(art.last_modified_at || art.published_at || new Date().toISOString()).split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">
  <url><loc>https://${a}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://${a}/articles</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://${a}/recommended</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://${a}/about</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://${a}/privacy</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
${items}
</urlset>`;
}

export async function buildLlmsTxt(req) {
  const a = req ? siteApex(req) : 'divorcefinance.com';
  const articles = await getArticles({ status: 'published' });
  const byCat = {};
  for (const art of articles) {
    const cat = art.category || 'General';
    (byCat[cat] = byCat[cat] || []).push(art);
  }
  let out = `# Divorce Finance

The financial guides nobody gave you when the marriage ended.
Concrete, practical, and ruthlessly honest about what rebuilding actually takes.

Site: https://${a}
`;
  for (const [cat, list] of Object.entries(byCat)) {
    out += `\n## ${cat}\n\n`;
    for (const art of list) {
      const desc = (art.metaDescription || '').replace(/\s+/g, ' ').slice(0, 200);
      out += `- [${art.title}](https://${a}/articles/${art.slug}): ${desc}\n`;
    }
  }
  return out;
}

export async function buildLlmsFullTxt(req) {
  const a = req ? siteApex(req) : 'divorcefinance.com';
  const articles = await getArticles({ status: 'published' });
  let out = `# Divorce Finance — Full Corpus\nSite: https://${a}\n\n`;
  for (const art of articles) {
    const text = (art.body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    out += `---
slug: ${art.slug}
title: ${art.title}
category: ${art.category}
published_at: ${art.published_at}
last_modified_at: ${art.last_modified_at || art.published_at}
url: https://${a}/articles/${art.slug}
---
${text}

`;
  }
  return out;
}

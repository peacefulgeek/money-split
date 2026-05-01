// Master scope §15D-§15F — maintenance.

import * as db from '../lib/db.mjs';
import { extractAsinsFromText, verifyAsin } from '../lib/amazon-verify.mjs';

// Monthly refresh: bump last_modified_at on the 5 oldest published articles.
// Cron: 0 0 5 1 * *  (1st of month, 05:00 UTC)
export async function runMonthlyRefresh() {
  const arts = await db.getArticles({ status: 'published' });
  const oldest = arts
    .sort((a, b) => new Date(a.last_modified_at || a.published_at) - new Date(b.last_modified_at || b.published_at))
    .slice(0, 5);
  for (const a of oldest) {
    await db.updateArticle(a.slug, { last_modified_at: new Date().toISOString() });
  }
  console.log(`[monthly] refreshed ${oldest.length} articles`);
  return { refreshed: oldest.length };
}

// Quarterly refresh: scan all articles for stale "current year" and tax-year tokens.
// Cron: 0 0 6 1 1,4,7,10 *
export async function runQuarterlyRefresh() {
  const arts = await db.getArticles({ status: 'published' });
  const thisYear = new Date().getFullYear();
  let touched = 0;
  for (const art of arts) {
    if (!art.body) continue;
    const oldYears = (art.body.match(/\b20\d{2}\b/g) || []).filter((y) => Number(y) < thisYear - 2);
    if (oldYears.length === 0) continue;
    let body = art.body;
    for (const y of [...new Set(oldYears)]) body = body.replaceAll(y, String(thisYear));
    await db.updateArticle(art.slug, { body, last_modified_at: new Date().toISOString() });
    touched += 1;
  }
  console.log(`[quarterly] year-bumped ${touched} articles`);
  return { touched };
}

// Sunday ASIN health check.  Cron: 0 0 12 * * 0
export async function runAsinHealth() {
  const arts = await db.getArticles({ status: 'published' });
  const asinUses = new Map();
  for (const a of arts) {
    for (const asin of extractAsinsFromText(a.body || '')) {
      if (!asinUses.has(asin)) asinUses.set(asin, []);
      asinUses.get(asin).push(a.slug);
    }
  }
  const broken = [];
  for (const asin of asinUses.keys()) {
    const r = await verifyAsin(asin);
    if (!r.valid) broken.push({ asin, reason: r.reason, slugs: asinUses.get(asin) });
    await new Promise((r) => setTimeout(r, 2500));
  }
  console.log(`[asin-health] ${asinUses.size} ASINs checked, ${broken.length} broken`);
  return { checked: asinUses.size, broken };
}

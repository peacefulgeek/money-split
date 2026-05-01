// Master scope §15A — phase-1 publisher.
// Cron: 0 0 7,10,13,16,19 * * *  (07/10/13/16/19 UTC, 5 fires per day).

import * as db from '../lib/db.mjs';

export async function runPhase1Publisher() {
  const queued = await db.getArticles({ status: 'queued' });
  if (queued.length === 0) {
    console.log('[phase1] queue empty, nothing to publish');
    return { published: 0 };
  }
  const next = queued.sort(
    (a, b) => new Date(a.queued_at) - new Date(b.queued_at)
  )[0];
  await db.updateArticle(next.slug, {
    status: 'published',
    published_at: new Date().toISOString(),
  });
  console.log(`[phase1] published ${next.slug}`);
  return { published: 1, slug: next.slug };
}

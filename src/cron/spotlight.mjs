// Master scope §15C — Saturday product spotlight.
// Cron: 0 0 14 * * 6
import * as db from '../lib/db.mjs';

export async function runSpotlight() {
  const arts = await db.getArticles({ status: 'published' });
  if (arts.length === 0) return { spotlighted: 0 };
  const featured = arts.sort(() => Math.random() - 0.5)[0];
  await db.updateArticle(featured.slug, { is_spotlight: true, spotlight_at: new Date().toISOString() });
  console.log(`[spotlight] highlighting ${featured.slug}`);
  return { spotlighted: 1, slug: featured.slug };
}

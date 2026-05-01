// Master scope §15B — phase-2 weekday fresh generator.
// Cron: 0 0 8 * * 1-5  (08:00 UTC Mon-Fri).
// Generates one new article using DeepSeek + quality gate, queues it.

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import * as db from '../lib/db.mjs';
import { generateArticle } from '../lib/deepseek-generate.mjs';
import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { assignHeroImage } from '../lib/bunny.mjs';
import { hasWritingEngineEnv } from '../lib/openai-client.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

export async function runPhase2Fresh({ authorName = 'The Oracle Lover', niche = 'divorce finance' } = {}) {
  if (!hasWritingEngineEnv()) {
    console.log('[phase2] OPENAI_API_KEY missing - skipping (env not yet wired)');
    return { generated: 0, reason: 'no-api-key' };
  }
  const catalog = JSON.parse(await fs.readFile(path.resolve(__dirname, '../data/catalog.json'), 'utf8'));
  const existing = await db.getArticles();
  const existingTitles = new Set(existing.map((a) => a.title.toLowerCase()));
  const candidate = catalog.topics.find((t) => !existingTitles.has(t.title.toLowerCase()));
  if (!candidate) {
    console.log('[phase2] no fresh topics, picking aged refresh');
    return { generated: 0, reason: 'no-topics' };
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = await generateArticle({
      topic: candidate.title,
      category: candidate.category,
      tags: candidate.tags,
      authorName, niche,
      catalog: catalog.products,
      relatedArticles: existing.map((a) => ({
        slug: a.slug, title: a.title, category: a.category, tags: a.tags || [],
      })),
    });
    const gate = runQualityGate(result.body);
    if (!gate.passed) {
      console.log(`[phase2] gate failed attempt ${attempt}: ${gate.failures.join(', ')}`);
      continue;
    }
    const slug = slugify(candidate.title);
    const heroImageUrl = await assignHeroImage(slug);
    await db.insertArticle({
      slug, title: candidate.title, category: candidate.category, tags: candidate.tags,
      body: result.body,
      metaDescription: candidate.title + ' - the practical, no-fluff guide.',
      ogTitle: candidate.title,
      heroImageUrl,
      status: 'queued',
      queued_at: new Date().toISOString(),
      author: authorName,
    });
    console.log(`[phase2] queued ${slug}`);
    return { generated: 1, slug };
  }
  console.log('[phase2] all 3 attempts failed gate');
  return { generated: 0, reason: 'gate-failed' };
}

// Master scope §11 — DeepSeek V4-Pro via OpenAI client.

import { client, openaiModel, hasWritingEngineEnv } from './openai-client.mjs';
import { buildHardRulesPrompt } from './hard-rules.mjs';
import { buildVoiceSpecPrompt } from './voice-spec.mjs';
import { buildEEATPrompt } from './eeat.mjs';
import { matchProducts } from './match-products.mjs';
import { pickInternalLinks } from './internal-links.mjs';

export async function generateArticle(ctx) {
  if (!hasWritingEngineEnv()) {
    throw new Error('OPENAI_API_KEY missing - DeepSeek writing engine not configured');
  }

  const products = matchProducts({
    articleTitle: ctx.topic,
    articleTags: ctx.tags || [],
    articleCategory: ctx.category,
    catalog: ctx.catalog || [],
    minLinks: 3, maxLinks: 4,
  });

  const internalLinks = pickInternalLinks({
    topic: ctx.topic,
    category: ctx.category,
    tags: ctx.tags || [],
    pool: ctx.relatedArticles || [],
    take: 4,
  });

  const systemPrompt = [
    buildVoiceSpecPrompt(ctx.authorName, ctx.niche),
    buildEEATPrompt(ctx.authorName, ctx.niche),
    buildHardRulesPrompt({ products, internalLinks }),
  ].join('\n\n');

  const userPrompt = [
    `TOPIC: ${ctx.topic}`,
    `CATEGORY: ${ctx.category}`,
    `TAGS: ${(ctx.tags || []).join(', ')}`,
    '',
    'Write the article now. Output: pure HTML body content (no <html>, <head>, or <body> tags).',
    'Start with a 3-sentence TL;DR block wrapped in <section data-tldr="ai-overview" aria-label="In short">...</section>.',
    'Then the article body with H2/H3 structure as specified in the HARD RULES.',
    'End with the author byline block exactly as specified.',
  ].join('\n');

  const response = await client.chat.completions.create({
    model: openaiModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.72,
  });

  const body = response.choices[0].message.content;
  return {
    body,
    productsUsed: products.map((p) => p.asin),
    internalLinksUsed: internalLinks.map((l) => l.slug),
    model: openaiModel,
  };
}

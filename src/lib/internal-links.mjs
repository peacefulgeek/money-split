// Master scope §14C — internal-link picker.

export function pickInternalLinks({ topic, category, tags, pool, take = 4 }) {
  const tagSet = new Set((tags || []).map((t) => t.toLowerCase()));
  const topicLower = (topic || '').toLowerCase();
  const scored = pool.map((p) => {
    let score = 0;
    if (p.category === category) score += 6;
    for (const t of p.tags || []) {
      if (tagSet.has(t.toLowerCase())) score += 2;
    }
    const titleLower = (p.title || '').toLowerCase();
    for (const w of topicLower.split(/\W+/).filter((w) => w.length > 4)) {
      if (titleLower.includes(w)) score += 1;
    }
    return { ...p, _score: score };
  })
    .filter((p) => p._score > 0)
    .sort((a, b) => b._score - a._score);
  return scored.slice(0, take);
}

export function matchProducts({ articleTitle, articleTags, articleCategory, catalog, minLinks = 3, maxLinks = 4 }) {
  const tagSet = new Set((articleTags || []).map((t) => t.toLowerCase()));
  const titleLower = (articleTitle || '').toLowerCase();
  const scored = catalog.map((p) => {
    let score = 0;
    if (p.category && p.category === articleCategory) score += 4;
    for (const t of p.tags || []) {
      if (tagSet.has((t || '').toLowerCase())) score += 2;
    }
    const nameLower = (p.name || '').toLowerCase();
    for (const w of titleLower.split(/\W+/).filter((w) => w.length > 4)) {
      if (nameLower.includes(w)) score += 1;
    }
    return { ...p, _score: score };
  });
  scored.sort((a, b) => b._score - a._score);
  const picks = scored.slice(0, Math.max(minLinks, Math.min(maxLinks, scored.length)));
  return picks;
}

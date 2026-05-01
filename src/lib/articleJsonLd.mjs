// Master scope §16E - Article + FAQPage JSON-LD.

export function buildArticleJsonLd({ article, apex, authorName }) {
  const url = `https://${apex}/articles/${article.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    image: article.heroImageUrl ? [article.heroImageUrl] : undefined,
    author: {
      '@type': 'Person',
      name: authorName || 'The Oracle Lover',
      url: 'https://theoraclelover.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Divorce Finance',
      url: `https://${apex}`,
    },
    datePublished: article.published_at,
    dateModified: article.last_modified_at || article.published_at,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  };
}

export function buildFaqJsonLd(article) {
  const html = article.body || '';
  const re = /<h([23])[^>]*>([^<]+\?)<\/h\1>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  const items = [];
  let m;
  while ((m = re.exec(html)) && items.length < 10) {
    const q = m[2].trim();
    const a = m[3].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (q && a) {
      items.push({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      });
    }
  }
  if (items.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items,
  };
}

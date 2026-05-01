// Master scope §16D - OG / Twitter card meta tags.

export function buildSocialMeta({ article, apex }) {
  const url = `https://${apex}/articles/${article.slug}`;
  return [
    `<meta property="og:type" content="article" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${escapeHtml(article.ogTitle || article.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(article.metaDescription)}" />`,
    article.heroImageUrl ? `<meta property="og:image" content="${article.heroImageUrl}" />` : '',
    `<meta property="og:site_name" content="Divorce Finance" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(article.ogTitle || article.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(article.metaDescription)}" />`,
    article.heroImageUrl ? `<meta name="twitter:image" content="${article.heroImageUrl}" />` : '',
  ].filter(Boolean).join('\n');
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Master scope §10A — Amazon ASIN verification.

export const AMAZON_TAG = process.env.AMAZON_TAG || 'spankyspinola-20';
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

const SOFT_404_PATTERNS = [
  /<title>[^<]*Page Not Found[^<]*<\/title>/i,
  /<title>[^<]*Sorry[^<]*<\/title>/i,
  /Looking for something\?[\s\S]{0,600}We're sorry/i,
  /The Web address you entered is not a functioning page/i,
  /id="g"[^>]*>[\s\S]{0,300}Dogs of Amazon/i,
  /We couldn't find that page/i,
];

const PRODUCT_SIGNATURES = [
  /id="productTitle"/,
  /id="titleSection"/,
  /name="ASIN"[^>]*value="[A-Z0-9]{10}"/,
  /data-asin="[A-Z0-9]{10}"/,
];

export function buildAmazonUrl(asin) {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

export async function verifyAsin(asin) {
  if (!/^[A-Z0-9]{10}$/.test(asin)) {
    return { asin, valid: false, reason: 'malformed-asin', url: null };
  }
  const url = buildAmazonUrl(asin);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });
    if (!res.ok) return { asin, valid: false, reason: `http-${res.status}`, url };
    const text = await res.text();
    for (const re of SOFT_404_PATTERNS) {
      if (re.test(text)) return { asin, valid: false, reason: 'soft-404', url };
    }
    const hasSig = PRODUCT_SIGNATURES.some((re) => re.test(text));
    if (!hasSig) return { asin, valid: false, reason: 'no-product-signature', url };
    const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;
    return { asin, valid: true, url, title };
  } catch (err) {
    return { asin, valid: false, reason: `fetch-error:${err.message}`, url };
  }
}

export async function verifyAsinBatch(asins, { delayMs = 2500, onProgress } = {}) {
  const results = [];
  for (let i = 0; i < asins.length; i++) {
    const r = await verifyAsin(asins[i]);
    results.push(r);
    if (onProgress) onProgress(i + 1, asins.length);
    if (i < asins.length - 1) await new Promise((r) => setTimeout(r, delayMs));
  }
  return results;
}

export function countAmazonLinks(html) {
  const re = /<a [^>]*href="https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}/gi;
  return (html.match(re) || []).length;
}

export function extractAsinsFromText(html) {
  const re = /\/dp\/([A-Z0-9]{10})/g;
  const out = new Set();
  let m;
  while ((m = re.exec(html))) out.add(m[1]);
  return [...out];
}

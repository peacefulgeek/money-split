// Bunny CDN for Site 96 — Divorce Finance.
// Per master scope §9, BUNNY_* values are HARDCODED here per site, not in env.
// These get filled in by the operator after they create the storage zone in
// Bunny.  Until then, assignHeroImage() returns the library URL it would have
// uploaded to so nothing breaks at build time.
//
// Replace the three constants below after creating the zone.

// Hardcoded Bunny credentials for The Money Split (per master scope §9).
export const BUNNY_STORAGE_ZONE = 'money-split';
export const BUNNY_API_KEY = '680fb241-99b9-47a5-9ba11d719774-1060-403b';
export const BUNNY_PULL_ZONE = 'https://money-split.b-cdn.net';
export const BUNNY_HOSTNAME = 'ny.storage.bunnycdn.com';

export function bunnyConfigured() {
  return BUNNY_API_KEY && BUNNY_API_KEY !== 'REPLACE_ME_BUNNY_API_KEY';
}

/**
 * Pick a random library image (1-40), copy to /images/{slug}.webp, return URL.
 * Falls back to the library URL if upload fails or Bunny isn't configured yet.
 */
export async function assignHeroImage(slug) {
  const idx = String(Math.floor(Math.random() * 40) + 1).padStart(2, '0');
  const sourceFile = `lib-${idx}.webp`;
  const destFile = `${slug}.webp`;
  const libraryUrl = `${BUNNY_PULL_ZONE}/library/${sourceFile}`;

  if (!bunnyConfigured()) return libraryUrl;

  try {
    const downloadRes = await fetch(libraryUrl);
    if (!downloadRes.ok) throw new Error(`download ${downloadRes.status}`);
    const imageBuffer = await downloadRes.arrayBuffer();

    const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/images/${destFile}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'image/webp' },
      body: imageBuffer,
    });
    if (!uploadRes.ok) throw new Error(`upload ${uploadRes.status}`);
    return `${BUNNY_PULL_ZONE}/images/${destFile}`;
  } catch (err) {
    console.warn(`[bunny.assignHeroImage] copy failed (${err.message}), falling back to library URL`);
    return libraryUrl;
  }
}

export async function uploadWebP(targetPath, buffer) {
  if (!bunnyConfigured()) {
    throw new Error('Bunny not configured — set BUNNY_API_KEY in src/lib/bunny.mjs');
  }
  const url = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${targetPath.replace(/^\//, '')}`;
  const ct = /\.webp$/i.test(targetPath) ? 'image/webp' : 'application/octet-stream';
  let lastErr;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': ct },
        body: buffer,
      });
      if (!res.ok) throw new Error(`bunny upload ${res.status} for ${targetPath}`);
      return `${BUNNY_PULL_ZONE}/${targetPath.replace(/^\//, '')}`;
    } catch (err) {
      lastErr = err;
      const wait = 800 * Math.pow(2, attempt) + Math.floor(Math.random() * 400);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

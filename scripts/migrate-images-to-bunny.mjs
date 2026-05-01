// scripts/migrate-images-to-bunny.mjs
//
// One-time migration: take every PNG in /home/ubuntu/webdev-static-assets,
// convert to WebP at q=80, upload to Bunny at /images/{name}.webp,
// rewrite src/data/hero-images.json + src/data/chrome-images.json so every
// URL points at https://money-split.b-cdn.net, then delete the local PNG.
//
// Idempotent: if a remote URL already responds 200, we skip re-upload.

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { uploadWebP, BUNNY_PULL_ZONE } from '../src/lib/bunny.mjs';

const STATIC_DIR = '/home/ubuntu/webdev-static-assets';
const HERO_JSON = path.resolve('src/data/hero-images.json');
const CHROME_JSON = path.resolve('src/data/chrome-images.json');
const ARTICLES_JSON = path.resolve('src/data/articles.json');

async function compressAndUpload(localPath, remoteName) {
  const remotePath = `images/${remoteName}.webp`;
  const remoteUrl = `${BUNNY_PULL_ZONE}/${remotePath}`;
  // Idempotency: skip if already there.
  try {
    const head = await fetch(remoteUrl, { method: 'HEAD' });
    if (head.status === 200) {
      console.log(`SKIP (exists)  ${remoteName}.webp`);
      return remoteUrl;
    }
  } catch {}
  const inputBuf = fs.readFileSync(localPath);
  const webpBuf = await sharp(inputBuf)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();
  await uploadWebP(remotePath, webpBuf);
  console.log(`UPLOAD  ${remoteName}.webp  (${(webpBuf.length / 1024).toFixed(0)}kb)`);
  return remoteUrl;
}

function listPngs() {
  return fs.readdirSync(STATIC_DIR).filter(f => /\.png$/i.test(f));
}

async function main() {
  if (!fs.existsSync(STATIC_DIR)) {
    console.log(`No local image cache at ${STATIC_DIR}, nothing to do.`);
    return;
  }

  const pngs = listPngs();
  console.log(`Found ${pngs.length} PNGs to migrate.`);

  const remoteByBase = {};
  for (const f of pngs) {
    const base = f.replace(/\.png$/i, '');
    const remote = await compressAndUpload(path.join(STATIC_DIR, f), base);
    remoteByBase[base] = remote;
  }

  // Rewrite hero-images.json: keys are slugs, values were /manus-storage/...png
  if (fs.existsSync(HERO_JSON)) {
    const heroes = JSON.parse(fs.readFileSync(HERO_JSON, 'utf8'));
    const next = {};
    for (const [slug, url] of Object.entries(heroes)) {
      // value is "/manus-storage/<base>_<hash>.png" — strip path/hash, find a matching base.
      const m = url.match(/\/([a-z0-9-]+?)_[a-f0-9]+\.png$/i);
      const base = m ? m[1] : slug;
      const remote = remoteByBase[base] || remoteByBase[slug] || url;
      next[slug] = remote;
    }
    fs.writeFileSync(HERO_JSON, JSON.stringify(next, null, 2));
    console.log(`Rewrote ${HERO_JSON} (${Object.keys(next).length} entries)`);
  }

  // chrome-images.json: same pattern (single object, key->url)
  if (fs.existsSync(CHROME_JSON)) {
    const chrome = JSON.parse(fs.readFileSync(CHROME_JSON, 'utf8'));
    const next = {};
    for (const [k, url] of Object.entries(chrome)) {
      const m = url.match(/\/([a-z0-9-]+?)_[a-f0-9]+\.png$/i);
      const base = m ? m[1] : k;
      const remote = remoteByBase[base] || url;
      next[k] = remote;
    }
    fs.writeFileSync(CHROME_JSON, JSON.stringify(next, null, 2));
    console.log(`Rewrote ${CHROME_JSON}`);
  }

  // Patch articles.json hero_image inline so the served API uses Bunny URLs.
  if (fs.existsSync(ARTICLES_JSON)) {
    const a = JSON.parse(fs.readFileSync(ARTICLES_JSON, 'utf8'));
    const heroes = JSON.parse(fs.readFileSync(HERO_JSON, 'utf8'));
    let patched = 0;
    for (const art of a.articles) {
      const next = heroes[art.slug];
      if (next && art.hero_image !== next) {
        art.hero_image = next;
        patched++;
      }
    }
    fs.writeFileSync(ARTICLES_JSON, JSON.stringify(a, null, 2));
    console.log(`Repointed ${patched}/${a.articles.length} article hero_image fields to Bunny.`);
  }

  // Delete the local PNG cache after successful upload.
  if (process.env.DELETE_LOCAL !== '0') {
    let deleted = 0;
    for (const f of pngs) {
      const remote = remoteByBase[f.replace(/\.png$/i, '')];
      if (remote) {
        fs.unlinkSync(path.join(STATIC_DIR, f));
        deleted++;
      }
    }
    console.log(`Deleted ${deleted} local PNGs from ${STATIC_DIR}.`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });

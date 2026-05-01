// Pull every non-Bunny image referenced anywhere in src/data/*.json,
// push to money-split.b-cdn.net under /images/{slug}.webp, rewrite URLs.

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { uploadWebP, BUNNY_PULL_ZONE } from '../src/lib/bunny.mjs';

const FILES = [
  'src/data/hero-images.json',
  'src/data/chrome-images.json',
  'src/data/articles.json',
];

function isBunny(url) {
  return typeof url === 'string' && url.startsWith(BUNNY_PULL_ZONE + '/');
}
function isHttp(url) {
  return typeof url === 'string' && /^https?:\/\//.test(url);
}

async function fetchToWebp(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`fetch ${r.status} ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  return sharp(buf).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
}

async function migrateOne(slug, url) {
  if (isBunny(url) || !isHttp(url)) return url;
  const remotePath = `images/${slug}.webp`;
  const remoteUrl = `${BUNNY_PULL_ZONE}/${remotePath}`;
  // Skip if exists
  try {
    const head = await fetch(remoteUrl, { method: 'HEAD' });
    if (head.status === 200) { console.log(`SKIP ${slug}`); return remoteUrl; }
  } catch {}
  console.log(`PULL ${slug}  <- ${url.slice(0, 70)}…`);
  const webp = await fetchToWebp(url);
  await uploadWebP(remotePath, webp);
  console.log(`PUSH ${slug}  ${(webp.length / 1024).toFixed(0)}kb -> ${remoteUrl}`);
  return remoteUrl;
}

async function processHero() {
  const p = 'src/data/hero-images.json';
  const map = JSON.parse(fs.readFileSync(p, 'utf8'));
  const next = {};
  for (const [slug, url] of Object.entries(map)) {
    next[slug] = await migrateOne(slug, url);
  }
  fs.writeFileSync(p, JSON.stringify(next, null, 2));
  return next;
}

async function processChrome() {
  const p = 'src/data/chrome-images.json';
  if (!fs.existsSync(p)) return {};
  const map = JSON.parse(fs.readFileSync(p, 'utf8'));
  const next = {};
  for (const [k, url] of Object.entries(map)) {
    next[k] = await migrateOne(`chrome-${k}`, url);
  }
  fs.writeFileSync(p, JSON.stringify(next, null, 2));
  return next;
}

async function processArticles(heroMap) {
  const p = 'src/data/articles.json';
  const a = JSON.parse(fs.readFileSync(p, 'utf8'));
  let n = 0;
  for (const art of a.articles) {
    const next = heroMap[art.slug];
    if (next && art.hero_image !== next) { art.hero_image = next; n++; }
  }
  fs.writeFileSync(p, JSON.stringify(a, null, 2));
  console.log(`Repointed ${n}/${a.articles.length} article hero_image fields.`);
}

async function main() {
  const heroMap = await processHero();
  await processChrome();
  await processArticles(heroMap);

  // Audit
  const heroNow = JSON.parse(fs.readFileSync('src/data/hero-images.json', 'utf8'));
  const offBunny = Object.values(heroNow).filter(u => !isBunny(u));
  const articlesNow = JSON.parse(fs.readFileSync('src/data/articles.json', 'utf8'));
  const articleOff = articlesNow.articles.filter(a => !isBunny(a.hero_image)).map(a => a.slug);
  console.log(`AUDIT  hero off-Bunny=${offBunny.length}  article off-Bunny=${articleOff.length}`);
  if (articleOff.length) console.log('  off:', articleOff);
}
main().catch(e => { console.error(e); process.exit(1); });

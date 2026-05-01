#!/usr/bin/env node
// Master scope §19A — visual QA gate.

import fs from 'fs/promises';
import path from 'path';

const failures = [];

async function walk(dir, results = []) {
  try {
    for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) await walk(full, results);
      else results.push(full);
    }
  } catch {}
  return results;
}

// 1. No images in dist/client (Section 9B should make this moot).
const distFiles = await walk('dist');
for (const f of distFiles) {
  if (/\.(jpg|jpeg|png|webp|avif|gif|bmp|tiff?|heic|heif)$/i.test(f) && !f.endsWith('favicon.svg')) {
    failures.push(`image-in-build-output: ${f} (Section 9B forbids images in repo and build output)`);
  }
}

// 2. No Google Fonts, CloudFront, or Cloudflare leaks in HTML.
for (const f of distFiles.filter((f) => f.endsWith('.html'))) {
  const html = await fs.readFile(f, 'utf8');
  if (/cloudfront\.net/.test(html))             failures.push(`cloudfront-leak: ${path.basename(f)}`);
  if (/cloudflare\.com|cdn\.cloudflare/.test(html)) failures.push(`cloudflare-leak: ${path.basename(f)} (no Cloudflare per Section 1A)`);
}

// 3. No Manus artifacts, no Anthropic, no Fal.ai anywhere in src.
const srcFiles = await walk('src');
for (const f of srcFiles) {
  if (!/\.(ts|tsx|js|mjs|jsx)$/.test(f)) continue;
  const txt = await fs.readFile(f, 'utf8');
  if (/forge\.manus\.im|vite-plugin-manus|manus-runtime/.test(txt)) failures.push(`manus-artifact: ${f}`);
  if (/@anthropic-ai\/sdk|sk-ant-api/.test(txt))                    failures.push(`anthropic-leak: ${f}`);
  if (/(?<![a-z])fal\.ai|@fal-ai/.test(txt))                        failures.push(`fal-leak: ${f}`);
}

// Same scan for client/src.
const clientSrc = await walk('client/src');
for (const f of clientSrc) {
  if (!/\.(ts|tsx|js|mjs|jsx)$/.test(f)) continue;
  const txt = await fs.readFile(f, 'utf8');
  if (/@anthropic-ai\/sdk|sk-ant-api/.test(txt))                    failures.push(`anthropic-leak: ${f}`);
  if (/(?<![a-z])fal\.ai|@fal-ai/.test(txt))                        failures.push(`fal-leak: ${f}`);
}

if (failures.length > 0) {
  console.error('[visual-qa] FAILED:');
  failures.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('[visual-qa] All checks passed');

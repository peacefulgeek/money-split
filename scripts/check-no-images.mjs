#!/usr/bin/env node
// Master scope §9B.1 — build-blocking enforcement: no images in repo.

import { execSync } from 'child_process';

const ALLOWED = new Set(['client/public/favicon.svg', 'public/favicon.svg']);
const IMAGE_EXT = /\.(png|jpe?g|gif|bmp|tiff?|webp|avif|heic|heif|ico|svg)$/i;

let tracked;
try {
  tracked = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean);
} catch (e) {
  // No git history yet (fresh project) — fall back to filesystem walk.
  console.log('[check-no-images] git not initialized yet, scanning filesystem');
  const { default: fs } = await import('fs');
  const { default: path } = await import('path');
  const root = process.cwd();
  const out = [];
  function walk(dir) {
    if (dir.includes('node_modules') || dir.includes('.git') || dir.includes('dist')) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      const rel = path.relative(root, full);
      if (ent.isDirectory()) walk(full);
      else out.push(rel);
    }
  }
  walk(root);
  tracked = out;
}

const violations = tracked.filter((f) => IMAGE_EXT.test(f) && !ALLOWED.has(f));

if (violations.length > 0) {
  console.error('[check-no-images] FAIL — image files present in repo:');
  violations.forEach((v) => console.error('  - ' + v));
  console.error('\nFix: move them to Bunny CDN under /library/ and rewrite references.');
  process.exit(1);
}

console.log('[check-no-images] OK — no image files tracked in the repo (favicon.svg exception aside)');

#!/usr/bin/env node
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const lines = [];
const log = (...a) => { lines.push(a.join(' ')); console.log(...a); };
const sh = c => { try { return execSync(c,{cwd:'/home/ubuntu/divorce-finance', stdio:['ignore','pipe','pipe']}).toString().trim(); } catch (e) { return ''; } };

// 1) Articles
const a = JSON.parse(fs.readFileSync('src/data/articles.json','utf8'));
const articles = a.articles;
log('Articles total:', articles.length);
const wc = articles.map(x => (x.body||'').split(/\s+/).filter(Boolean).length);
log('Word count min/avg/max:', Math.min(...wc), Math.round(wc.reduce((s,x)=>s+x,0)/wc.length), Math.max(...wc));

// 2) Gate
const banned = [/\bdelve\b/i,/\butili[sz]e\b/i,/\bplethora\b/i,/\bmyriad\b/i,/\bnavigate\b/i,/\bleverage\b/i,/\bin today's\b/i,/\bworld of\b/i,/—|–/,/!/];
let fails = 0;
for (const x of articles) {
  for (const re of banned) {
    if (re.test(x.body)) { fails++; log('  banned hit:', x.slug, re.toString()); break; }
  }
}
log('Banned-term failures:', fails);

// 3) Cadence
const days = new Set(articles.map(x => x.published_at.slice(0,10)));
log('Unique calendar days:', days.size, '(target ≥27)');

// 4) Cron schedule presence
const sch = fs.readFileSync('src/cron/schedule.mjs','utf8');
log('Cron schedule.mjs size:', sch.length, 'bytes');
log('Cron schedule expressions:', (sch.match(/cron:\s*['"][0-9*\/\, \-]+['"]/g)||[]).length);

// 5) Redirect-first
const srv = fs.readFileSync('server/index.ts','utf8');
const wwwIdx = srv.indexOf('www');
const firstUseIdx = srv.indexOf('app.use');
log('WWW redirect declared before first app.use():', wwwIdx > 0 && wwwIdx < firstUseIdx);

// 6) Banned deps
const banDeps = ['@anthropic-ai/sdk','ANTHROPIC_API_KEY','FAL_KEY','fal.ai','manus-runtime'];
for (const dep of banDeps) {
  const hits = sh(`grep -r ${JSON.stringify(dep)} src/ server/ client/src/ scripts/ package.json 2>/dev/null | grep -v node_modules | grep -v dist | head -3`);
  log('Banned-leak ' + JSON.stringify(dep) + ':', hits ? 'HIT' : 'clean');
}

// 7) No images in repo
const imgs = sh('find . -type f \\( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" \\) -not -path "./node_modules/*" -not -path "./dist/*"');
const imgList = imgs.split('\n').filter(Boolean).filter(f=>!/favicon\.svg$/.test(f));
log('Image files in repo (excluding favicon.svg):', imgList.length);

// 8) Bunny URL coverage in articles
const bunny = articles.filter(x => /money-split\.b-cdn\.net/.test(JSON.stringify(x))).length;
log('Articles referencing money-split.b-cdn.net:', bunny + ' / ' + articles.length);

// 9) Per-article gate
let okIntern=0, okExt=0, okAff=0, okSelf=0, okTLDR=0;
for (const x of articles) {
  const intern = (x.body.match(/href="\/articles\//g)||[]).length;
  const ext = (x.body.match(/href="https?:\/\/(?!themoneysplit\.com|money-split\.b-cdn\.net|www\.amazon\.com)/g)||[]).length;
  const aff = (x.body.match(/amazon\.com\/dp\/[A-Z0-9]+/g)||[]).length;
  const self = x.body.includes('/articles/' + x.slug);
  const tldrMatch = (x.tldr||[]).length >= 3;
  if (intern >= 3) okIntern++;
  if (ext >= 1) okExt++;
  if (aff >= 3) okAff++;
  if (self) okSelf++;
  if (tldrMatch) okTLDR++;
}
log('≥3 internal links:', okIntern + '/' + articles.length);
log('≥1 external authoritative link:', okExt + '/' + articles.length);
log('≥3 Amazon affiliate links:', okAff + '/' + articles.length);
log('Self-reference:', okSelf + '/' + articles.length);
log('≥3 TL;DR points:', okTLDR + '/' + articles.length);

// 10) Build artefacts
log('Build artefacts present:', fs.existsSync('dist/index.js') && fs.existsSync('dist/public/index.html'));

// 11) Bunny chrome image presence in JSON
const chrome = JSON.parse(fs.readFileSync('src/data/chrome-images.json','utf8'));
log('Chrome image entries:', Object.keys(chrome).length);
log('All chrome URLs on Bunny:', Object.values(chrome).every(u => /money-split\.b-cdn\.net/.test(u)));

// 12) Apothecary
const apoth = JSON.parse(fs.readFileSync('src/data/apothecary.json','utf8'));
log('Apothecary items:', apoth.items.length, 'tag:', apoth.tag);

fs.writeFileSync('/tmp/final-audit.txt', lines.join('\n'));
log('saved /tmp/final-audit.txt');

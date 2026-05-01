#!/usr/bin/env node
import { SCHEDULES, dryRunAll } from '../src/cron/schedule.mjs';
import cron from 'node-cron';

let allValid = true;
for (const s of SCHEDULES) {
  const ok = cron.validate(s.cron);
  console.log(`[cron] ${s.name.padEnd(20)} ${s.cron.padEnd(22)} valid=${ok}`);
  if (!ok) allValid = false;
}
if (!allValid) {
  console.error('[cron] one or more cron expressions invalid');
  process.exit(1);
}

console.log('\n[cron] dry-run all handlers:');
const results = await dryRunAll();
for (const r of results) {
  console.log(`  ${r.name}: ${r.error ? 'ERROR ' + r.error : JSON.stringify(r.result)}`);
}
console.log('[cron] dry-run complete');

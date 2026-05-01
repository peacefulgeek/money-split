#!/usr/bin/env node
// Master scope §15 — start-with-cron entrypoint for production hosts.
// Spins up the dist/index.js Express server AND registers the in-process
// node-cron schedules.
//
// Run:    node scripts/start-with-cron.mjs
// Or:     pnpm start:cron

import cron from 'node-cron';
import { spawn } from 'child_process';
import { SCHEDULES } from '../src/cron/schedule.mjs';

console.log('[start-with-cron] booting Express + cron supervisor');

const app = spawn(process.execPath, ['dist/index.js'], { stdio: 'inherit' });
app.on('exit', (code) => process.exit(code));

for (const s of SCHEDULES) {
  if (!cron.validate(s.cron)) {
    console.error(`[start-with-cron] INVALID cron expression for ${s.name}: ${s.cron}`);
    continue;
  }
  cron.schedule(s.cron, async () => {
    const t0 = Date.now();
    console.log(`[cron] ${s.name} fire @${new Date().toISOString()}`);
    try {
      const r = await s.handler();
      console.log(`[cron] ${s.name} done in ${Date.now() - t0}ms ::`, JSON.stringify(r));
    } catch (e) {
      console.error(`[cron] ${s.name} ERROR ::`, e.message);
    }
  }, { timezone: 'Etc/UTC' });
  console.log(`[cron] registered ${s.name} :: ${s.cron} UTC`);
}

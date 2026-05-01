// Master scope §15 - canonical cron schedule for Site 96.
// All times UTC. Format: standard 5-field cron (node-cron / cron syntax).

import { runPhase1Publisher } from './phase1-publisher.mjs';
import { runPhase2Fresh } from './phase2-fresh.mjs';
import { runSpotlight } from './spotlight.mjs';
import { runMonthlyRefresh, runQuarterlyRefresh, runAsinHealth } from './maintenance.mjs';

export const SCHEDULES = [
  { name: 'phase1-publisher',  cron: '0 7,10,13,16,19 * * *', handler: runPhase1Publisher },
  { name: 'phase2-fresh',      cron: '0 8 * * 1-5',           handler: runPhase2Fresh    },
  { name: 'spotlight',         cron: '0 14 * * 6',            handler: runSpotlight      },
  { name: 'monthly-refresh',   cron: '0 5 1 * *',             handler: runMonthlyRefresh },
  { name: 'quarterly-refresh', cron: '0 6 1 1,4,7,10 *',      handler: runQuarterlyRefresh },
  { name: 'asin-health',       cron: '0 12 * * 0',            handler: runAsinHealth     },
];

export async function dryRunAll() {
  const out = [];
  for (const s of SCHEDULES) {
    try {
      const r = await s.handler();
      out.push({ name: s.name, cron: s.cron, result: r });
    } catch (e) {
      out.push({ name: s.name, cron: s.cron, error: e.message });
    }
  }
  return out;
}

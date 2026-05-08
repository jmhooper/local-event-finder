import '@src/load-env';

import prisma from '@src/db';
import { SCRAPER_JOBS, ScraperJob } from '@src/jobs/queues';
import { runScraper } from '@src/jobs/run-scraper';

const SCRAPERS: Record<string, ScraperJob> = Object.fromEntries(
  SCRAPER_JOBS.map((job) => [job.jobName.replace(/^scrape-/, ''), job])
);

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith('--'));
const flags = new Set(args.filter((arg) => arg.startsWith('--')));

const scraperName = positional[0];
const save = flags.has('--save');

if (!scraperName || !(scraperName in SCRAPERS)) {
  console.error(
    `Unknown scraper: "${scraperName}". Available: ${Object.keys(SCRAPERS).join(', ')}`
  );
  process.exit(1);
}

const job = SCRAPERS[scraperName];

const run = async () => {
  if (save) {
    const { events } = await runScraper({ source: job.source, scraper: job.scraper });
    console.log(JSON.stringify(events, null, 2));
  } else {
    const events = await job.scraper();
    console.log(JSON.stringify(events, null, 2));
  }
};

run()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

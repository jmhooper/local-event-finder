import { PgBoss } from 'pg-boss';
import logger from '@src/logger';
import { runScraper } from '@src/jobs/run-scraper';
import { SCRAPER_JOBS } from '@src/jobs/queues';

const TZ = process.env.SCHEDULE_TZ ?? 'America/New_York';

/**
 * Boots pg-boss, registers a worker + cron schedule for each scraper, and
 * returns the running boss instance so the caller can shut it down on exit.
 */
export const startScheduler = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to start the scheduler');
  }

  const boss = new PgBoss({ connectionString: databaseUrl });

  boss.on('error', (err: Error) => logger.error(`[pg-boss] ${err.message}`));

  await boss.start();
  logger.info('[scheduler] pg-boss started');

  for (const job of SCRAPER_JOBS) {
    await boss.createQueue(job.jobName);
    await boss.work(job.jobName, async () => {
      await runScraper({ source: job.source, scraper: job.scraper });
    });
    await boss.schedule(job.jobName, job.cron, undefined, { tz: TZ });
    logger.info(`[scheduler] Registered ${job.jobName} (cron='${job.cron}', tz=${TZ})`);
  }

  return boss;
};

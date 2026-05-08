import logger from '@src/logger';
import { EventList, EventSource } from '@src/event';
import { ScraperFunction } from '@scrapers/types';
import prisma from '@src/db';

export interface RunScraperOptions {
  source: EventSource;
  scraper: ScraperFunction;
}

export interface RunScraperResult {
  runId: number;
  events: EventList;
}

/**
 * Runs a scraper, recording the run in `scraper_runs` and persisting the
 * resulting events to the `events` table. Errors are captured on the run row
 * (`errored_at` + `error`) and re-thrown so the caller (e.g. pg-boss) can mark
 * the job as failed.
 */
export const runScraper = async ({
  source,
  scraper,
}: RunScraperOptions): Promise<RunScraperResult> => {
  const run = await prisma.scraperRun.create({ data: { source } });
  logger.info(`[run-scraper] Started run #${run.id} for ${source}`);

  try {
    const events = await scraper();

    if (events.length > 0) {
      await prisma.event.createMany({
        data: events.map((event) => ({
          run_id: run.id,
          source: event.source,
          name: event.name,
          description: event.description ?? null,
          date: event.date ?? null,
          start_time: event.start_time ?? null,
          end_time: event.end_time ?? null,
          location_name: event.location_name ?? null,
          location_address: event.location_address ?? null,
          link: event.link ?? null,
          tags: event.tags,
        })),
      });
    }

    await prisma.scraperRun.update({
      where: { id: run.id },
      data: { finished_at: new Date() },
    });

    logger.info(
      `[run-scraper] Run #${run.id} completed: ${events.length} events for ${source}`
    );
    return { runId: run.id, events };
  } catch (err) {
    const message = err instanceof Error ? (err.stack ?? err.message) : String(err);
    logger.error(`[run-scraper] Run #${run.id} failed for ${source}: ${message}`);
    await prisma.scraperRun.update({
      where: { id: run.id },
      data: { errored_at: new Date(), error: message },
    });
    throw err;
  }
};

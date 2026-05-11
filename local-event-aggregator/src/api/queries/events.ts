import { DateTime } from '@utils/dayjs';
import prisma from '@src/db';
import { EventList, EventSource } from '@src/event';

const EVENTS_TZ = process.env.SCHEDULE_TZ ?? 'America/New_York';

/**
 * Returns today's date in `EVENTS_TZ` formatted as `YYYY-MM-DD`. We compare
 * event dates as strings, so the format must match the values stored in the
 * `events.date` column.
 */
const todayDateString = () => DateTime().tz(EVENTS_TZ).format('YYYY-MM-DD');

/**
 * Find the id of the most recent successful run for each {@link EventSource}.
 * Sources with no successful run yet are skipped.
 */
const findLatestRunIdsBySource = async (): Promise<number[]> => {
  const sources = Object.values(EventSource);
  const runs = await Promise.all(
    sources.map((source) =>
      prisma.scraperRun.findFirst({
        where: {
          source,
          errored_at: null,
          finished_at: { not: null },
        },
        orderBy: { started_at: 'desc' },
        select: { id: true },
      })
    )
  );
  return runs.filter((run): run is { id: number } => run !== null).map((run) => run.id);
};

/**
 * Returns events drawn from the latest successful run of each source,
 * combined, filtered to exclude past dates, and sorted by date ascending then
 * start time ascending (nulls last on both).
 */
export const getLatestEvents = async (): Promise<EventList> => {
  const runIds = await findLatestRunIdsBySource();
  if (runIds.length === 0) return [];

  const today = todayDateString();

  const rows = await prisma.event.findMany({
    where: {
      run_id: { in: runIds },
      OR: [{ date: null }, { date: { gte: today } }],
    },
    orderBy: [
      { date: { sort: 'asc', nulls: 'last' } },
      { start_time: { sort: 'asc', nulls: 'last' } },
    ],
  });

  return rows.map((row) => ({
    name: row.name,
    description: row.description ?? undefined,
    date: row.date ?? undefined,
    start_time: row.start_time ?? undefined,
    end_time: row.end_time ?? undefined,
    location_name: row.location_name ?? undefined,
    location_address: row.location_address ?? undefined,
    link: row.link ?? undefined,
    tags: row.tags,
    source: row.source as EventSource,
  }));
};

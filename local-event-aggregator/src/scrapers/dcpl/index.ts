import { ScraperFunction } from '@scrapers/types';
import logger from '@src/logger';
import { Event } from '@src/event';
import { fetchDCPLEvents } from './fetch';
import { transformDCPLEvents } from './transform';
import { filterBusinessHoursEvents, filterEventsWithLLM } from './filter';

/**
 * This {@link ScraperFunction} reads events from the Kramer Books API and converts those events into our {@link Event} format
 *
 * @returns An array with elements of type {@link Event} that have been read from the Kramer Books API
 */
export const scrapeDCPL: ScraperFunction = async () => {
  logger.info('[DCPL] Fetching DCPL event data');
  const rawEvents = await fetchDCPLEvents();
  logger.info(`[DCPL] Fetched ${rawEvents.length} DCPL events`);

  logger.info(`[DCPL] Transforming ${rawEvents.length} DCPL events`);
  let events = transformDCPLEvents(rawEvents);
  logger.info(`[DCPL] Transformed ${events.length} events`);

  logger.info(`[DCPL] Filtering from ${events.length} to exclude events during business hours`);
  events = filterBusinessHoursEvents(events);
  logger.info(`[DCPL] Filtered DCPL events to ${events.length} events outside of business hours`);

  logger.info(`[DCPL] Filtering ${events.length} DCPL events with LLM`);
  events = await filterEventsWithLLM(events);
  logger.info(`[DCPL] Filtered to ${events.length} DCPL events with LLM`);

  return events;
};

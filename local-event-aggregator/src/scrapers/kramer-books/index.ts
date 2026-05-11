import { ScraperFunction } from '@scrapers/types';
import logger from '@src/logger';
import { Event } from '@src/event';
import { fetchEventData } from '@scrapers/kramer-books/fetch';
import { transformEventData } from '@scrapers/kramer-books/transform';

/**
 * This {@link ScraperFunction} reads events from the Kramer Books API and converts those events into our {@link Event} format
 *
 * @returns An array with elements of type {@link Event} that have been read from the Kramer Books API
 */
export const scrapeKramerBooks: ScraperFunction = async () => {
  logger.info('[Kramer Books] Fetching Kramer Books event data');
  const rawEvents = await fetchEventData();
  logger.info(`[Kramer Books] Fetched ${rawEvents.length} Kramer Books events`);

  logger.info('[Kramer Books] Transofrming Kramer Books events');
  const transformedEvents = await transformEventData(rawEvents);
  logger.info(`[Kramer Books] Transformed ${transformedEvents.length} Kramer Books events`);

  return transformedEvents;
};

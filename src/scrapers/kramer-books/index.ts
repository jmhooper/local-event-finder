import { ScraperFunction } from '@scrapers/types';
import logger from '@src/logger';
import { fetchEventData } from '@scrapers/kramer-books/fetch';
import { transformEventData } from '@scrapers/kramer-books/transform';

export const scrapeKramerBooks: ScraperFunction = async () => {
  logger.info('Fetching Kramer Books event data');
  const rawEvents = await fetchEventData();
  logger.info(`Fetched ${rawEvents.length} Kramer Books events`);

  logger.info('Transofrming Kramer Books events');
  const transformedEvents = await transformEventData(rawEvents);
  logger.info(`Transformed ${transformedEvents.length} Kramer Books events`);

  return transformedEvents;
};

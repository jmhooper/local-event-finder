import { ScraperFunction } from '@scrapers/types';
import logger from '@src/logger';
import { Event, EventSource } from '@src/event';
import { fetchAndExtractLostCityBooksEventMarkdown } from '@scrapers/lost-city-books/fetch';
import ModelName from '@llm/models';
import { extractEventDataWithLLM } from '@llm/event-extract';

/**
 * This {@link ScraperFunction} reads events from the Lost City Books website and uses an LLM to extract those events into our {@link Event} format
 *
 * @returns An array with elements of type {@link Event} that have been read from the Lost City Books website
 */
export const scrapeLostCityBooks: ScraperFunction = async () => {
  logger.info('[Lost City Books] Fetching Lost City Books Event Page Data');
  const markdown = await fetchAndExtractLostCityBooksEventMarkdown();
  logger.info(`[Lost City Books] Fetched markdown events blob with ${markdown.length} characters`);

  const model = ModelName.GPT_5;

  logger.info(`[Lost City Books] Extracting events with ${model}`);
  const events = await extractEventDataWithLLM(model, markdown, EventSource.LOST_CITY_BOOKS);
  logger.info(`[Lost City Books] Extracted ${events.length} events with ${model}`);
  return events;
};

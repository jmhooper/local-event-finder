import { ScraperFunction } from '@scrapers/types';
import logger from '@src/logger';
import { Event, EventSource } from '@src/event';
import { fetchAndExtractPopvilleEventMarkdown } from '@scrapers/popville/fetch';
import ModelName from '@llm/models';
import { extractEventDataWithLLM } from '@llm/event-extract';

/**
 * This {@link ScraperFunction} reads events from the Lost City Books website and uses an LLM to extract those events into our {@link Event} format
 *
 * @returns An array with elements of type {@link Event} that have been read from the Lost City Books website
 */
export const scrapePopville: ScraperFunction = async () => {
  logger.info('[Popville] Fetching Popville Event Page Data');
  const markdown = await fetchAndExtractPopvilleEventMarkdown();
  logger.info(`[Popville] Fetched markdown events blob with ${markdown.length} characters`);

  const model = ModelName.GPT_5;

  logger.info(`[Popville] Extracting events with ${model}`);
  const events = await extractEventDataWithLLM(model, markdown, EventSource.POPVILLE);
  logger.info(`[Popville] Extracted ${events.length} events with ${model}`);
  return events;
};

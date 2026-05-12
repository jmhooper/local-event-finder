import { ScraperFunction } from '@scrapers/types';
import logger from '@src/logger';
import { Event, EventSource } from '@src/event';
import { fetchAndExtract730DCEventMarkdown } from '@scrapers/seven-thirty-dc/fetch';
import ModelName from '@llm/models';
import { extractEventDataWithLLM } from '@llm/event-extract';

/**
 * This {@link ScraperFunction} reads events from the 730DC website and uses an LLM to extract those events into our {@link Event} format
 *
 * @returns An array with elements of type {@link Event} that have been read from the 730DC website
 */
export const scrape730DC: ScraperFunction = async () => {
  logger.info('[730DC] Fetching 730DC Event Page Data');
  const markdown = await fetchAndExtract730DCEventMarkdown();
  logger.info(`[730DC] Fetched markdown events blob with ${markdown.length} characters`);

  const model = ModelName.GPT_5;

  logger.info(`[730DC] Extracting events with ${model}`);
  const events = await extractEventDataWithLLM(model, markdown, EventSource.SEVEN_THIRY_DC);
  logger.info(`[730DC] Extracted ${events.length} events with ${model}`);
  return events;
};

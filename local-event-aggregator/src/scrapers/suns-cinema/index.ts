import { ScraperFunction } from '@scrapers/types';
import logger from '@src/logger';
import { Event, EventSource } from '@src/event';
import { fetchAndExtracSunsCinemaEventMarkdown } from './fetch';
import ModelName from '@llm/models';
import { extractEventDataWithLLM } from '@llm/event-extract';

const SUNS_CINEMA_LLM_EXTRACT_INSTRUCTIONS =
  'Please extract the events. Do not include events for shows that are sold out. Append "Suns Cinema: " to the event name. The location name should be "Suns Cinema" and the location address should be "3107 Mt Pleasant St NW, Washington, DC 20010".';

/**
 * This {@link ScraperFunction} reads events from the Lost City Books website and uses an LLM to extract those events into our {@link Event} format
 *
 * @returns An array with elements of type {@link Event} that have been read from the Lost City Books website
 */
export const scrapeSunsCinema: ScraperFunction = async () => {
  logger.info('[Suns Cinema] Fetching Suns Cinema upcoming shows page data');
  const markdown = await fetchAndExtracSunsCinemaEventMarkdown();
  logger.info(`[Suns Cinema] Fetched markdown events blob with ${markdown.length} characters`);

  const model = ModelName.GPT_5;

  logger.info(`[Suns Cinema] Extracting events with ${model}`);
  const events = await extractEventDataWithLLM(
    model,
    markdown,
    EventSource.SUNS_CINEMA,
    SUNS_CINEMA_LLM_EXTRACT_INSTRUCTIONS
  );
  logger.info(`[Suns Cinema] Extracted ${events.length} events with ${model}`);
  return events;
};

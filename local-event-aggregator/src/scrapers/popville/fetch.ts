import { fetchText } from '@utils/fetch';
import { extractHTMLAtSelector, convertHTMLToMarkdown } from '@utils/html';

const POPVILLE_WEEKLY_SCHEDULER_URL = 'https://www.popville.com/events/';

/**
 * This function goes to the Popville events calendar page and gets the HTML.
 * The upcoming events section is extracted, converted into markdown, and returned.
 *
 * @returns Markdown extracted from the upcoming events
 */
export const fetchAndExtractPopvilleEventMarkdown = async (): Promise<string> => {
  const responseText = await fetchText(POPVILLE_WEEKLY_SCHEDULER_URL);
  const extractedHTML = await extractHTMLAtSelector(responseText, '.events-calendar');
  const markdown = await convertHTMLToMarkdown(extractedHTML);

  return markdown;
};

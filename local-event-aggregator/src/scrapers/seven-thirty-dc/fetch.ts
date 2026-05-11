import { fetchText } from '@utils/fetch';
import { extractHTMLAtSelector, convertHTMLToMarkdown } from '@utils/html';

const SEVEN_THIRTY_WEEKLY_SCHEDULER_URL = 'https://www.730dc.com/weekly-scheduler';

/**
 * This function goes to the 730DC weekly scheduler page and gets the HTML.
 * The upcoming events section is extracted, converted into markdown, and returned.
 *
 * @returns Markdown extracted from the upcoming events
 */
export const fetchAndExtract730DCEventMarkdown = async (): Promise<string> => {
  const responseText = await fetchText(SEVEN_THIRTY_WEEKLY_SCHEDULER_URL);
  const extractedHTML = await extractHTMLAtSelector(responseText, '.weekly-scheduler-rich-text');
  const markdown = await convertHTMLToMarkdown(extractedHTML);

  return markdown;
};

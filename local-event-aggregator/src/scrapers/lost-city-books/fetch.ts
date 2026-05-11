import { fetchText } from '@utils/fetch';
import { extractHTMLAtSelector, convertHTMLToMarkdown } from '@utils/html';

const LOST_CITY_BOOKS_EVENTS_PAGES = [
  'https://lostcitybookstore.com/upcoming-events?page=0',
  'https://lostcitybookstore.com/upcoming-events?page=1',
  'https://lostcitybookstore.com/upcoming-events?page=2',
  'https://lostcitybookstore.com/upcoming-events?page=3',
  'https://lostcitybookstore.com/upcoming-events?page=4',
];

/**
 * This function goes to the Lost City Books events page and gets the HTML.
 * The upcoming events section is extracted, converted into markdown, and returned.
 *
 * @returns Markdown extracted from the upcoming events
 */
export const fetchAndExtractLostCityBooksEventMarkdown = async (): Promise<string> => {
  const joinedMarkdownBlobs = (
    await Promise.all(
      LOST_CITY_BOOKS_EVENTS_PAGES.map(async (url) => {
        const htmlResponse = await fetchText(url);
        const markdown = convertHTMLToMarkdown(
          extractHTMLAtSelector(htmlResponse, '.upcoming-events')
        );
        return markdown;
      })
    )
  ).join('\n\n\n');

  return joinedMarkdownBlobs;
};

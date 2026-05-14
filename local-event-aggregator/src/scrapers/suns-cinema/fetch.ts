import { fetchText } from '@utils/fetch';
import { extractHTMLAtSelector, convertHTMLToMarkdown } from '@utils/html';

const SUNS_CINEMA_UPCOMING_SHOWS_URL = 'https://sunscinema.com/upcoming-films-3/';

/**
 * This function goes to the Popville events calendar page and gets the HTML.
 * The upcoming events section is extracted, converted into markdown, and returned.
 *
 * @returns Markdown extracted from the upcoming events
 */
export const fetchAndExtracSunsCinemaEventMarkdown = async (): Promise<string> => {
  const responseText = await fetchText(SUNS_CINEMA_UPCOMING_SHOWS_URL);
  const extractedHTML = await extractHTMLAtSelector(responseText, '.show-list');
  const markdown = await convertHTMLToMarkdown(extractedHTML);

  return markdown;
};

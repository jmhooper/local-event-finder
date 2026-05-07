import TurndownService from 'turndown';
import { load } from 'cheerio';

const turndown = new TurndownService({ headingStyle: 'atx' });

/**
 * This function takes an HTML string and removes HTML tags
 *
 * @param html - The HTML string to remove tags from
 * @returns  The string with HTML tags removed
 */
export const stripHTMLTags = (html: string): string =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;| /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const convertHTMLToMarkdown = (html: string): string => turndown.turndown(html);

/**
 * Returns the innerHTML of the first node matching the given CSS selector
 *
 * @param html - The HTML string to search
 * @param selector - A CSS selector
 *
 * @returns The html extracted from the given node or an empty string for no match
 */
export const extractHTMLAtSelector = (html: string, selector: string): string => {
  const $ = load(html);
  return $(selector).first().html() ?? '';
};

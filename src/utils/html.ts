import TurndownService from 'turndown';

const turndown = new TurndownService({ headingStyle: 'atx' });

export const stripHTMLTags = (html: string): string =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;| /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const convertHTMLToMarkdown = (html: string): string => turndown.turndown(html);

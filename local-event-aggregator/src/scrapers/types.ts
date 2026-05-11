import { EventList } from '@src/event';

/**
 * This type represents a scraper function.
 * This an async function that returns a list of events.
 */
export type ScraperFunction = () => Promise<EventList>;

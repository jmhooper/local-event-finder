import { EventList } from '@src/event';

export type ScraperFunction = () => Promise<EventList>;

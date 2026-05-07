import { DateTime } from '@utils/dayjs';
import { Event, EventSource } from '@src/event';
import { KramersEvent } from '@scrapers/kramer-books/fetch';
import { stripHTMLTags } from '@src/utils/html';

const KRAMER_BOOKS_ADDRESS = '1517 Connecticut Ave NW, Washington, DC 20036';

const convertDateFormat = (dateString: string) => {
  return DateTime(dateString, 'YYYYMMDD').format('YYYY-MM-DD');
};

const convertTimeFormat = (timeString: string) => {
  return DateTime(timeString, 'HH:mm:ss').format('HH:mm');
};

const convertCategoryToTag = (categoryName: string) => {
  return categoryName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z_]/g, '');
};

/**
 * This function takes an array of events from the Kramers API and transform them into the {@link Event} format
 *
 * @param kramerEvents - An array of events in the {@link KramersEvent} format
 * @returns A transformed list of events in the {@link Event} format
 */
export const transformEventData: (kramerEvents: KramersEvent[]) => Promise<Event[]> = async (
  kramerEvents: KramersEvent[]
) => {
  const transformedEvents = kramerEvents.map((kramerEvent) => ({
    name: kramerEvent.title,
    description: stripHTMLTags(kramerEvent.summary),
    date: convertDateFormat(kramerEvent.date),
    start_time: kramerEvent.start_time ? convertTimeFormat(kramerEvent.start_time) : null,
    end_time: kramerEvent.end_time ? convertTimeFormat(kramerEvent.end_time) : null,
    location: {
      name: kramerEvent.location_text,
      address: kramerEvent.location_text === 'Kramers' ? KRAMER_BOOKS_ADDRESS : null,
    },
    link: `https://kramers.com/events/${kramerEvent.id}`,
    tags: ['books', convertCategoryToTag(kramerEvent.category.name)],
    source: EventSource.KRAMER_BOOKS,
  }));

  return Promise.resolve(transformedEvents);
};

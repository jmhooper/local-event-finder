import { DateTime } from '@src/utils/dayjs';
import { Event, EventSource } from '@src/event';
import { DCPLEvent } from '@scrapers/dcpl/fetch';

const DCPL_LIBRARY_TO_ADDRESS_MAP: Record<string, string> = {
  'Martin Luther King Jr. Memorial Library - Central Library': '901 G St NW, Washington, DC 20001',
  'Cleveland Park Neighborhood Library:': '3310 Connecticut Ave NW, Washington, DC 20008',
  'Mt. Pleasant Neighborhood Library': '3160 16th St NW, Washington, DC 20010',
};

const convertDCPLTagToEventTag = (dcplTag: string) => {
  return dcplTag
    .toLowerCase()
    .replace('&', 'and')
    .replace(/\s+/g, '_')
    .replace(/[^a-z_]/g, '')
    .replace(/_{2,}/, '_');
};

export const transformDCPLEvents = (dcplEvents: DCPLEvent[]): Event[] => {
  return dcplEvents.map((dcplEvent) => {
    const parsedStart = DateTime(dcplEvent.event_start, 'YYYY-MM-DD HH:mm:ss');
    const parsedEnd = DateTime(dcplEvent.event_end, 'YYYY-MM-DD HH:mm:ss');

    let tags = dcplEvent.tagsArray.map((dcplTag) => convertDCPLTagToEventTag(dcplTag));
    if (tags.indexOf('library') < 0) {
      tags = ['library', ...tags];
    }

    return {
      name: dcplEvent.title,
      description: dcplEvent.description,
      date: parsedStart.format('YYYY-MM-DD'),
      start_time: parsedStart.format('HH:mm'),
      end_time: parsedEnd.format('HH:mm'),
      location_name: dcplEvent.location,
      location_address: DCPL_LIBRARY_TO_ADDRESS_MAP[dcplEvent.location],
      link: `https://dclibrary.libnet.info/event/${dcplEvent.id}`,
      source: EventSource.DCPL,
      tags,
    };
  });
};

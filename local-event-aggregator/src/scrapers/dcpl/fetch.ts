import * as z from 'zod';
import { DateTime } from '@src/utils/dayjs';
import { fetchJSONWithResponseSchema } from '@src/utils/fetch';

const DCPLEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  event_start: z.string(),
  event_end: z.string(),
  location: z.string(),
  tagsArray: z.array(z.string()),
  url: z.string(),
});
export type DCPLEvent = z.infer<typeof DCPLEventSchema>;

const buildDCPLFetchEventsUrl = () => {
  const formattedDate = DateTime().format('YYYY-MM-DD');
  return `https://dclibrary.libnet.info/eeventcaldata?event_type=0&req=%7B%22private%22%3Afalse%2C%22date%22%3A%22${formattedDate}%22%2C%22days%22%3A30%2C%22locations%22%3A%5B%222309%22%2C%222316%22%2C%222317%22%5D%2C%22ages%22%3A%5B%22Adults%22%5D%2C%22types%22%3A%5B%5D%7D`;
};

export const fetchDCPLEvents = () =>
  fetchJSONWithResponseSchema(buildDCPLFetchEventsUrl(), z.array(DCPLEventSchema));

import * as z from 'zod';
import { fetchJSONWithResponseSchema } from '@src/utils/fetch';

const KRAMER_BOOKS_SESSION_URL = 'https://api.bookmanager.com/customer/session/get?_cb=1562584';
const KRAMER_BOOKS_EVENTS_URL = 'https://api.bookmanager.com/customer/event/v2/list?_cb=1562584';

const KramersCreateSessionApiResponseSchema = z.looseObject({
  session_id: z.string(),
});

const KramersEventSchema = z.looseObject({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  summary: z.string(),
  date: z.string(),
  start_time: z.optional(z.string()),
  end_time: z.optional(z.string()),
  location_text: z.string(),
  category: z.looseObject({ name: z.string() }),
});
const KramersEventResponseSchema = z.looseObject({
  rows: z.array(KramersEventSchema),
});

export type KramersEvent = z.infer<typeof KramersEventSchema>;

const fetchSessionId = async () => {
  const response = await fetchJSONWithResponseSchema(
    KRAMER_BOOKS_SESSION_URL,
    KramersCreateSessionApiResponseSchema,
    {
      method: 'POST',
      body: new URLSearchParams({ store_id: '1430969' }),
    }
  );
  return response.session_id;
};

const fetchEventsResponse = async (sessionID: string) => {
  const response = await fetchJSONWithResponseSchema(
    KRAMER_BOOKS_EVENTS_URL,
    KramersEventResponseSchema,
    {
      method: 'POST',
      body: new URLSearchParams({ store_id: '1430969', session_id: sessionID }),
    }
  );
  return response;
};

/**
 * Fetches event data from the API serving Kramer's events page.
 *
 * This API request requires 2 fetch requests:
 *
 * 1. A request to get a session ID
 * 2. A request uing that session ID to get event data
 *
 * The events are parsed out of the response to the second request
 *
 * @returns A promise for a the event data
 */
export const fetchEventData: () => Promise<KramersEvent[]> = async () => {
  const sessionID = await fetchSessionId();
  const eventsResponse = await fetchEventsResponse(sessionID);

  return eventsResponse.rows;
};

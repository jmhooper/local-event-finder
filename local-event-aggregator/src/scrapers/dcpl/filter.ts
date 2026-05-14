import * as z from 'zod';
import { Event, EventListSchema } from '@src/event';
import ModelName from '@src/llm/models';
import { fetchChatCompletionWithFormatSchema } from '@llm/chat';
import { DateTime } from '@src/utils/dayjs';
import Holidays from 'date-holidays';

const holidays = new Holidays('US', 'DC');

export const filterBusinessHoursEvents = (events: Event[]): Event[] => {
  return events.filter((event) => {
    if (!event.date) {
      return true;
    }
    const date = DateTime(event.date);

    // Include all weekend events
    if (date.day() === 0 || date.day() === 6) {
      return true;
    }

    // Include events on holidays
    if (holidays.isHoliday(date.toDate())) {
      return true;
    }

    if (!event.start_time) {
      return true;
    }

    const startHour = parseInt(event.start_time.split(':')[0]);

    // Return events that start outside of business hours
    return startHour < 8 || startHour > 17;
  });
};

const DCPL_LLM_FILTER_PROMPT = `
You are a specialized event filtering assistant. You take a JSON list of events and remove events according to the given criteria.

**Do not include** any explanation, commentary, or Markdown formatting in your response — return only the raw JSON array.

Go through this JSON array of events and remove any events for language classes, computer classes / certifications, non-english events, or ESL / Braille classes:s
`;

export const filterEventsWithLLM = async (events: Event[]): Promise<Event[]> => {
  const results = await fetchChatCompletionWithFormatSchema(
    ModelName.GPT_5,
    [
      {
        role: 'user',
        content:
          DCPL_LLM_FILTER_PROMPT + `\n\n\`\`\`\n${JSON.stringify({ events }, null, 2)}\n\`\`\``,
      },
    ],
    z.object({ events: EventListSchema }),
    'events'
  );
  return results.events;
};

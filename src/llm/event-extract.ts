import * as z from 'zod';
import ModelName from '@llm/models';
import { EventList, EventSource, EventListSchema } from '@src/event';
import { ChatMessage, fetchChatCompletionWithFormatSchema } from '@llm/chat';

const SYSTEM_PROMPT = `You are a specialized data extraction assistant. Your task is to parse Markdown content that has been converted from HTML event listing pages and convert the events into structured JSON data. The Markdown may be messy, inconsistently formatted, or contain noise such as navigation remnants, footer text, or repeated content — ignore anything that is not clearly event data.

## Instructions

1. **Extract** all events found in the provided Markdown content.
2. **Ignore noise** such as navigation menus, cookie notices, footer links, social media prompts, and any other non-event content.
3. **Normalize** dates into ISO 8601 format (YYYY-MM-DD).
4. **Normalize** times into 24-hour format (HH:MM), if present.
5. **Clean** all extracted text by stripping any residual Markdown formatting symbols where they don't add meaning (e.g. excessive asterisks, pipes, or brackets).
6. **Infer missing data carefully** — if a field cannot be reliably determined from the content, use \`null\` for optional fields. Do not fabricate information.
7. **Always return a valid JSON array**, even if only one event is found or no events are found (return an empty array \`[]\` in that case).
8. **Do not include** any explanation, commentary, or Markdown formatting in your response — return only the raw JSON array.

## Field Rules

- \`name\`: The event title. Required. Plain text only. Do not include events without a name.
- \`description\`: A clean plain text summary or description of the event. Use null if no description can be found.
- \`date\`: The event date in ISO 8601 format (YYYY-MM-DD). Use the start date if a date range is given. Do not inlcude any events for which a date cannot be determined. Today's date is {{ $today.format('yyyy-MM-dd') }}.
- \`start_time\`: The event start time in 24-hour format (HH:MM). Use \`null\` if not present.
- \`end_time\`: The event end time in 24-hour format (HH:MM). Use \`null\` if not present.
- \`location.name\`: The name of the venue or location for the event. Use \`null\` if no name is specified for the location.
- \`location.address\`: The address of the location for the event. Use \`null\` if no address is specified.
- \`link\`: The full absolute URL to the event or registration page. Use \`null\` if no link is found.
- \'tags\`: A list of 1-6 tags to identify the event. Tags should be lower cased and underscored.
- \`source\`: The source of the event data. This should be see to "{{ SOURCE_NAME }}".

## Handling Messy Markdown

- If dates or times are written in natural language (e.g. "Next Friday", "July 15th", "3pm"), convert them appropriately.
- If the same event appears to be listed more than once due to formatting artifacts, include it only once.
- If a block of text is ambiguous and may or may not be an event, use your best judgment based on whether it has at least a name and some context.

## Filtering

The user may provide criteria for what events should be included. If this is the case only include events that meet the criteria.`;

/**
 * This function sends a message to an LLM asking them to extract a list of events from the given markdown.
 *
 * @param model - The model to use to process the events
 * @param markdown - The markdown to read events from
 * @param sourceName - The name of the source to assign to the `source` property on the events
 * @param userInstructions - Optional specific instructions to provide to the model for this source
 *
 * @returns A list of events parsed form the LLM response
 */
export const extractEventDataWithLLM = async (
  model: ModelName,
  markdown: string,
  sourceName: EventSource,
  userInstructions = 'Please extract the events from the markdown'
): Promise<EventList> => {
  const systemPrompt = SYSTEM_PROMPT.replace('{{ SOURCE_NAME }}', sourceName);
  const userMessage = `${userInstructions}\n\nHere is the markdown:\n\n${markdown}`;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];

  const response = await fetchChatCompletionWithFormatSchema(
    model,
    messages,
    z.object({ events: EventListSchema }),
    'EventData'
  );

  return response.events;
};

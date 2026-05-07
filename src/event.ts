import * as z from 'zod';
import { colors } from '@utils/colors';

export enum EventSource {
  KRAMER_BOOKS = 'Kramer Books',
  LOST_CITY_BOOKS = 'Lost City Books',
}

const EventSourceEnum = z.enum(EventSource);

/**
 * A schema for validating and parsing an Events
 */
export const EventSchema = z.object({
  name: z.string(),
  description: z.nullable(z.string()),
  date: z.nullable(z.iso.date()),
  start_time: z.nullable(z.iso.time()),
  end_time: z.nullable(z.iso.time()),
  location: z.object({
    name: z.nullable(z.string()),
    address: z.nullable(z.string()),
  }),
  link: z.nullable(z.url()),
  tags: z.array(z.string().regex(/([a-z]|_)+/)),
  source: EventSourceEnum,
});
/**
 * A schema for validating and parsing a list of Events
 */
export const EventListSchema = z.array(EventSchema);

/**
 * An object that represents an event.
 */
export type Event = z.infer<typeof EventSchema>;
/**
 * An array of {@link Event} objects
 */
export type EventList = z.infer<typeof EventListSchema>;

/**
 * JSON Schema for an {@link EventList}
 */
export const EVENT_LIST_JSON_SCHEMA = JSON.stringify(EventListSchema.toJSONSchema(), null, 2);

/**
 * Error object to represent errors that can occur parsing a serialized EventList
 *
 * The error may contain an `issues` property.
 * This is copied from the {@link z.ZodError | ZodError } if parsing into the Zod schema fails.
 */
export class EventListParseError extends Error {
  issues: z.core.$ZodIssue[] | undefined = [];

  constructor(message: string, issues?: z.core.$ZodIssue[]) {
    super(message);
    Object.setPrototypeOf(this, EventListParseError.prototype);
    this.name = 'EventListParseError';
    this.issues = issues;
  }
}

const formatJSONParseErrorMessage = (input: string) => {
  const message =
    [
      `${colors.red}Unable to parse event list. The event list input is not valid JSON.${colors.reset}`,
      '=====',
      'Input:' + colors.bright + colors.blue,
      input + colors.reset,
    ].join('\n\n') + '\n\n';

  return message;
};

const formatSchemaParseErrorMessage = (input: any, issues: z.core.$ZodIssue[]) => {
  const message =
    [
      `${colors.red}Unable to parse event list. The event list input does not match the schema for an event list.${colors.reset}`,
      '=====',
      'Input:' + colors.bright + colors.blue,
      JSON.stringify(input, null, 2) + colors.reset,
      '=====',
      'Schema:' + colors.bright + colors.magenta,
      EVENT_LIST_JSON_SCHEMA + colors.reset,
      '=====',
      'Issues:' + colors.bright + colors.yellow,
      JSON.stringify(issues, null, 2) + colors.reset,
    ].join('\n\n') + '\n\n';

  return message;
};

/**
 * Returns an EventList parsed from the given string
 *
 * @param input - An event list serialized into a JSON string
 * @returns The parsed array of events as an {@link EventList}
 */
export const parseEventListJSON = async (input: string) => {
  let parsedInput: unknown;
  try {
    parsedInput = JSON.parse(input);
  } catch (error) {
    const errorMessage = formatJSONParseErrorMessage(input);
    const parseError = new EventListParseError(errorMessage);
    return Promise.reject(parseError);
  }

  const result = EventListSchema.safeParse(parsedInput);
  if (!result.success) {
    const errorMessage = formatSchemaParseErrorMessage(parsedInput, result.error.issues);
    const parseError = new EventListParseError(errorMessage, result.error.issues);
    return Promise.reject(parseError);
  }
  return Promise.resolve(result.data!);
};

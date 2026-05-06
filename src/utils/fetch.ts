import * as z from 'zod';
import { colors } from '@utils/colors';

/**
 * Error object to represent a failure fetching or parsing a response with a Zod Schema
 */
export class FetchJSONWithResponseSchemaError extends Error {}

const formatHTTPResponseErrorMessage = (url: string, status: number, body: string) => {
  return (
    [
      `An HTTP error occured making an HTTP request`,
      '=====',
      `URL:    ${colors.bright}${colors.blue}${url}${colors.reset}`,
      `Status: ${colors.bright}${colors.red}${status}${colors.reset}`,
      'Body:',
      `${colors.bright}${colors.magenta}${body}${colors.reset}`,
    ].join('\n') + '\n\n'
  );
};

const formatResponseJSONParseError = (url: string, body: string) => {
  return (
    [
      `The response returned by HTTP request was not valid JSON`,
      '=====',
      `URL:    ${colors.bright}${colors.blue}${url}${colors.reset}`,
      'Body:',
      `${colors.bright}${colors.magenta}${body}${colors.reset}`,
    ].join('\n') + '\n\n'
  );
};

const formatResponseBodyParseError = (
  url: string,
  responseJSON: any,
  schema: z.ZodSchema,
  error: z.ZodError
) => {
  return (
    [
      `The response returned by HTTP request did not match the expected schema`,
      '\n=====\n',
      `URL: ${colors.bright}${colors.blue}${url}${colors.reset}\n`,
      `Response:${colors.bright}${colors.cyan}\n`,
      JSON.stringify(responseJSON, null, 2) + colors.reset,
      '\n=====\n',
      `Schema:${colors.bright}${colors.magenta}\n`,
      JSON.stringify(schema.toJSONSchema(), null, 2),
      '\n=====\n',
      `Issues:${colors.bright}${colors.yellow}\n`,
      JSON.stringify(error.issues, null, 2),
    ].join('\n') + '\n\n'
  );
};

/**
 * Makes a fetch request and expects a JSON response which it uses the given schema to parse.
 *
 * @param url - The URL where the request will be made
 * @param schema - A Zod schema used to parse the response
 * @param init - Init options to be passed to fetch
 *
 * @returns The result of calling `schema.parse` on the parsed JSON response body
 *
 * @throws FetchJSONWithResponseSchemaError
 * This exception is thrown for errors that occur making the request or processing the response
 */
export const fetchJSONWithResponseSchema: <T>(
  url: string,
  schema: z.ZodSchema<T>,
  init: RequestInit
) => Promise<T> = async (url, schema, init) => {
  const httpResponse = await fetch(url, init);

  const rawResponseBody = await httpResponse.text().catch(() => '');

  if (!httpResponse.ok) {
    throw new FetchJSONWithResponseSchemaError(
      formatHTTPResponseErrorMessage(url, httpResponse.status, rawResponseBody)
    );
  }

  let responseBody: any;
  try {
    responseBody = JSON.parse(rawResponseBody);
  } catch (err) {
    throw new FetchJSONWithResponseSchemaError(formatResponseJSONParseError(url, rawResponseBody));
  }

  const parsedResponseResult = schema.safeParse(responseBody);

  if (!parsedResponseResult.success) {
    throw new FetchJSONWithResponseSchemaError(
      formatResponseBodyParseError(url, responseBody, schema, parsedResponseResult.error)
    );
  }

  return parsedResponseResult.data!;
};

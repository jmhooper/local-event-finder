import * as z from 'zod';
import { colors } from '@utils/colors';
import ModelName from '@llm/models';
import { fetchJSONWithResponseSchema } from '@utils/fetch';

/**
 * This type represents a message in a LLM exchange
 */
export type ChatMessage = {
  content: string;
  role: 'user' | 'assistant' | 'system';
};

type ChatCompletionAPIRequestBody = {
  model: ModelName;
  messages: ChatMessage[];
  response_format?: {
    type: 'json_schema';
    json_schema: {
      name: string;
      schema: object;
    };
  };
};

const fetchChatCompletionURL = () => process.env.LITELLM_API_HOST + '/chat/completions';

const fetchChatCompletionHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${process.env.LITELLM_API_KEY}`,
});

const ChatCompletionResponseSchema = z.looseObject({
  choices: z
    .array(
      z.looseObject({
        message: z.looseObject({
          content: z.string(),
        }),
      })
    )
    .min(1),
});

/**
 * Error object to represent a failure fetching or parsing a response with a Zod Schema
 */
export class LLMChatError extends Error {}

const stripCodeBlockFences = (response: string): string => {
  const trimmed = response.trim();
  if (!trimmed.startsWith('```') || !trimmed.endsWith('```')) {
    return response;
  }
  return trimmed.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
};

const formatChatCompletionResponseJSONErrorMessage = (model: ModelName, response: string) => {
  return (
    [
      `An error occured parsing the LLM response from ${model} as JSON.`,
      '\n=====\n',
      `Response Message:${colors.bright}${colors.blue}\n`,
      response,
    ].join('\n') + '\n\n'
  );
};

const formatChatCompletionResponseFormatErrorMessage = (
  model: ModelName,
  response: any,
  schema: z.ZodSchema,
  error: z.ZodError
) => {
  return (
    [
      `An error occured parsing the LLM response from ${model}.`,
      '\n=====\n',
      `Response Message:${colors.bright}${colors.blue}\n`,
      JSON.stringify(response, null, 2) + colors.reset,
      '\n=====\n',
      `Schema:${colors.bright}${colors.yellow}\n`,
      JSON.stringify(schema.toJSONSchema(), null, 2) + colors.reset,
      '\n=====\n',
      `'Issues:'${colors.bright}${colors.red}\n`,
      JSON.stringify(error.issues, null, 2) + colors.reset,
    ].join('\n') + '\n\n'
  );
};

/**
 * This function sends messages to /chat/competions and returns the response from the LLM
 *
 * @param model The model to use. See {@link ModelName}
 * @param messages An array of {@link ChatMessage} objects to send to the LLM
 * @param responseSchema An optonal schema to describe the desired output format
 *
 * @returns The content of the response from the LLN
 */
export const fetchChatCompletion = async (
  model: ModelName,
  messages: ChatMessage[],
  responseSchema?: { schema: z.ZodSchema<object>; name: string }
): Promise<string> => {
  const requestBody: ChatCompletionAPIRequestBody = {
    model,
    messages,
  };

  if (responseSchema) {
    requestBody.response_format = {
      type: 'json_schema',
      json_schema: {
        name: responseSchema.name,
        schema: responseSchema.schema.toJSONSchema(),
      },
    };
  }

  const apiResponse = await fetchJSONWithResponseSchema(
    fetchChatCompletionURL(),
    ChatCompletionResponseSchema,
    {
      method: 'POST',
      headers: fetchChatCompletionHeaders(),
      body: JSON.stringify(requestBody),
    }
  );

  return apiResponse.choices[0].message.content;
};

/**
 * This method sends messages to /chat/completions and gets a response from the LLM.
 * The response is parsed with the given response schema and returned.
 *
 * @param model The model to use. See {@link ModelName}
 * @param messages An array of {@link ChatMessage} objects to send to the LLM
 * @param responseSchema A {@link z.ZodSchema} that is used to specify the response format and parse the response
 * @param schemaName The name given to the schema. This is passed to the LLM.
 *
 * @returns The result form the LLM parsed using the response schema
 */
export const fetchChatCompletionWithFormatSchema = async <T extends object>(
  model: ModelName,
  messages: ChatMessage[],
  responseSchema: z.ZodSchema<T>,
  schemaName: string
): Promise<T> => {
  const rawLLMResponse = await fetchChatCompletion(model, messages, {
    schema: responseSchema,
    name: schemaName,
  });

  let llmResponseObject: any;
  try {
    llmResponseObject = JSON.parse(stripCodeBlockFences(rawLLMResponse));
  } catch {
    throw new LLMChatError(formatChatCompletionResponseJSONErrorMessage(model, rawLLMResponse));
  }

  const parseResult = responseSchema.safeParse(llmResponseObject);

  if (!parseResult.success) {
    throw new LLMChatError(
      formatChatCompletionResponseFormatErrorMessage(
        model,
        llmResponseObject,
        responseSchema,
        parseResult.error
      )
    );
  }

  return parseResult.data;
};

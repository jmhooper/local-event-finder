import * as z from 'zod';
import {
  fetchChatCompletion,
  fetchChatCompletionWithFormatSchema,
  LLMChatError,
  ChatMessage,
} from './chat';
import ModelName from './models';

const mockResponse = (status: number, body: unknown) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  } as Response);

const buildCompletionResponse = (content: string) => ({
  choices: [{ message: { content } }],
});

const messages: ChatMessage[] = [
  { role: 'system', content: 'be helpful' },
  { role: 'user', content: 'hello' },
];

describe('fetchChatCompletion', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      LITELLM_API_HOST: 'https://llm.example.com',
      LITELLM_API_KEY: 'test-key',
    };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  it('POSTs to {LITELLM_API_HOST}/chat/completions with auth headers and the model + messages in the body', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockReturnValue(mockResponse(200, buildCompletionResponse('hi there')));

    await fetchChatCompletion(ModelName.HAIKU, messages);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://llm.example.com/chat/completions');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-key',
    });

    const body = JSON.parse(init?.body as string);
    expect(body).toEqual({ model: ModelName.HAIKU, messages });
    expect(body.response_format).toBeUndefined();
  });

  it('returns the content from the first choice on a valid response', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockReturnValue(mockResponse(200, buildCompletionResponse('the answer')));

    const result = await fetchChatCompletion(ModelName.SONNET, messages);

    expect(result).toBe('the answer');
  });

  it('includes response_format with the schema name and JSON schema when responseSchema is provided', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockReturnValue(mockResponse(200, buildCompletionResponse('{}')));

    const schema = z.object({ id: z.number(), name: z.string() });

    await fetchChatCompletion(ModelName.OPUS, messages, {
      schema,
      name: 'Person',
    });

    const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(body.response_format).toEqual({
      type: 'json_schema',
      json_schema: {
        name: 'Person',
        schema: schema.toJSONSchema(),
      },
    });
  });
});

describe('fetchChatCompletionWithFormatSchema', () => {
  const ORIGINAL_ENV = process.env;
  const schema = z.object({ id: z.number(), name: z.string() });

  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      LITELLM_API_HOST: 'https://llm.example.com',
      LITELLM_API_KEY: 'test-key',
    };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  it('returns the parsed object when the LLM response matches the schema', async () => {
    const data = { id: 1, name: 'Test' };
    jest
      .spyOn(globalThis, 'fetch')
      .mockReturnValue(mockResponse(200, buildCompletionResponse(JSON.stringify(data))));

    const result = await fetchChatCompletionWithFormatSchema(
      ModelName.HAIKU,
      messages,
      schema,
      'Person'
    );

    expect(result).toEqual(data);
  });

  it('strips surrounding code block fences before parsing the LLM response', async () => {
    const data = { id: 1, name: 'Test' };
    const fenced = '```json\n' + JSON.stringify(data) + '\n```';
    jest
      .spyOn(globalThis, 'fetch')
      .mockReturnValue(mockResponse(200, buildCompletionResponse(fenced)));

    const result = await fetchChatCompletionWithFormatSchema(
      ModelName.HAIKU,
      messages,
      schema,
      'Person'
    );

    expect(result).toEqual(data);
  });

  it('throws LLMChatError when the LLM response content is not valid JSON', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockReturnValue(mockResponse(200, buildCompletionResponse('not json')));

    const error = await fetchChatCompletionWithFormatSchema(
      ModelName.HAIKU,
      messages,
      schema,
      'Person'
    ).catch((e) => e);

    expect(error).toBeInstanceOf(LLMChatError);
    expect(error.message).toContain('parsing the LLM response');
    expect(error.message).toContain('JSON');
  });

  it('throws LLMChatError when the parsed JSON does not match the schema', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockReturnValue(
        mockResponse(200, buildCompletionResponse(JSON.stringify({ id: 'not-a-number' })))
      );

    const error = await fetchChatCompletionWithFormatSchema(
      ModelName.HAIKU,
      messages,
      schema,
      'Person'
    ).catch((e) => e);

    expect(error).toBeInstanceOf(LLMChatError);
    expect(error.message).toContain('parsing the LLM response');
  });
});

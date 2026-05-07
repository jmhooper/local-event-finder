import * as z from 'zod';
import { fetchText, fetchJSONWithResponseSchema, FetchJSONWithResponseSchemaError } from './fetch';

const TestSchema = z.object({ id: z.number(), name: z.string() });
const TEST_URL = 'https://example.com/api';

const mockResponse = (status: number, body: string) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body),
  } as Response);

describe('fetchText', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolves with the response body text on a successful response', async () => {
    jest.spyOn(globalThis, 'fetch').mockReturnValue(mockResponse(200, 'hello world'));

    expect(await fetchText(TEST_URL)).toBe('hello world');
  });

  it('throws FetchJSONWithResponseSchemaError on a non-ok HTTP response', async () => {
    jest.spyOn(globalThis, 'fetch').mockReturnValue(mockResponse(404, 'Not Found'));
    const error = await fetchText(TEST_URL).catch((e) => e);

    expect(error).toBeInstanceOf(FetchJSONWithResponseSchemaError);
    expect(error.message).toContain('HTTP error');
  });
});

describe('fetchJSONWithResponseSchema', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws FetchJSONWithResponseSchemaError when response body is not valid JSON', async () => {
    jest.spyOn(globalThis, 'fetch').mockReturnValue(mockResponse(200, 'not json'));
    const error = await fetchJSONWithResponseSchema(TEST_URL, TestSchema, {}).catch((e) => e);

    expect(error).toBeInstanceOf(FetchJSONWithResponseSchemaError);
    expect(error.message).toContain('not valid JSON');
  });

  it('throws FetchJSONWithResponseSchemaError when response does not match schema', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockReturnValue(mockResponse(200, JSON.stringify({ foo: 'bar' })));
    const error = await fetchJSONWithResponseSchema(TEST_URL, TestSchema, {}).catch((e) => e);

    expect(error).toBeInstanceOf(FetchJSONWithResponseSchemaError);
    expect(error.message).toContain('did not match the expected schema');
  });

  it('resolves with parsed data for a valid response', async () => {
    const data = { id: 1, name: 'Test' };
    jest.spyOn(globalThis, 'fetch').mockReturnValue(mockResponse(200, JSON.stringify(data)));
    const result = await fetchJSONWithResponseSchema(TEST_URL, TestSchema, {});

    expect(result).toEqual(data);
  });
});

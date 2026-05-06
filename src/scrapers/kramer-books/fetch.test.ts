import { fetchEventData } from './fetch';
import { sessionApiResponseFixture, eventsApiResponseFixture } from './fixtures';

const mockResponse = (status: number, body: unknown) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response);

describe('fetchEventData', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolves with event rows on a successful response', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockReturnValueOnce(mockResponse(200, sessionApiResponseFixture))
      .mockReturnValueOnce(mockResponse(200, eventsApiResponseFixture));

    const result = await fetchEventData();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe(eventsApiResponseFixture.rows[0].title);
  });
});

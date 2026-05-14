import { fetchDCPLEvents } from './fetch';
import { dcplEventFixture } from './fixtures';

const mockResponse = (status: number, body: unknown) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response);

describe('fetchDCPLEvents', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolves with the parsed DCPL events on a successful response', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockReturnValueOnce(mockResponse(200, [dcplEventFixture]));

    const result = await fetchDCPLEvents();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(dcplEventFixture.id);
  });
});

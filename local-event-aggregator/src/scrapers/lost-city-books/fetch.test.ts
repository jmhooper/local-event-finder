import { fetchAndExtractLostCityBooksEventMarkdown } from './fetch';

const mockResponse = (status: number, body: string) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body),
  } as Response);

const buildPage = (eventName: string) =>
  `<html><body><nav>nav junk</nav><div class="upcoming-events"><h2>${eventName}</h2></div><footer>footer junk</footer></body></html>`;

describe('fetchAndExtractLostCityBooksEventMarkdown', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches each paginated event page, extracts the upcoming-events section, and returns the joined markdown', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    for (let i = 0; i < 5; i++) {
      fetchSpy.mockReturnValueOnce(mockResponse(200, buildPage(`Event ${i}`)));
    }

    const result = await fetchAndExtractLostCityBooksEventMarkdown();

    expect(fetchSpy).toHaveBeenCalledTimes(5);
    expect(fetchSpy.mock.calls.map((c) => c[0])).toEqual([
      'https://lostcitybookstore.com/upcoming-events?page=0',
      'https://lostcitybookstore.com/upcoming-events?page=1',
      'https://lostcitybookstore.com/upcoming-events?page=2',
      'https://lostcitybookstore.com/upcoming-events?page=3',
      'https://lostcitybookstore.com/upcoming-events?page=4',
    ]);

    for (let i = 0; i < 5; i++) {
      expect(result).toContain(`Event ${i}`);
    }
    expect(result).not.toContain('nav junk');
    expect(result).not.toContain('footer junk');
  });
});

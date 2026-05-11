import { fetchAndExtract730DCEventMarkdown } from './fetch';

const mockResponse = (status: number, body: string) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body),
  } as Response);

const page = `<html><body><nav>nav junk</nav><div class="weekly-scheduler-rich-text"><h2>This Week</h2></div><footer>footer junk</footer></body></html>`;

describe('fetchAndExtract730DCEventMarkdown', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches the weekly scheduler page, extracts the rich-text section, and returns it as markdown', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockReturnValue(mockResponse(200, page));

    const result = await fetchAndExtract730DCEventMarkdown();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe('https://www.730dc.com/weekly-scheduler');

    expect(result).toContain('This Week');
    expect(result).not.toContain('nav junk');
    expect(result).not.toContain('footer junk');
  });
});

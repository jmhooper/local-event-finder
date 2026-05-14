import { fetchAndExtracSunsCinemaEventMarkdown } from './fetch';

const mockResponse = (status: number, body: string) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body),
  } as Response);

const page = `<html><body><nav>nav junk</nav><div class="show-list"><h2>Upcoming Films</h2></div><footer>footer junk</footer></body></html>`;

describe('fetchAndExtracSunsCinemaEventMarkdown', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches the upcoming films page, extracts the show-list section, and returns it as markdown', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockReturnValue(mockResponse(200, page));

    const result = await fetchAndExtracSunsCinemaEventMarkdown();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe('https://sunscinema.com/upcoming-films-3/');

    expect(result).toContain('Upcoming Films');
    expect(result).not.toContain('nav junk');
    expect(result).not.toContain('footer junk');
  });
});

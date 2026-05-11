import { parseEventListJSON, EventListParseError } from './event';

const validEvent = {
  name: 'Jazz Night',
  description: 'Live jazz at the venue.',
  date: '2026-06-15',
  start_time: '19:00:00',
  end_time: '22:00:00',
  location_name: 'The Anthem',
  location_address: '901 Wharf St SW, Washington, DC 20024',
  link: 'https://example.com/jazz-night',
  tags: ['music'],
  source: 'Kramer Books',
};

describe('parseEventListJSON', () => {
  it('rejects with EventListParseError when input is not valid JSON', async () => {
    const error = await parseEventListJSON('not json').catch((e) => e);

    expect(error).toBeInstanceOf(EventListParseError);
    expect(error.message).toContain('not valid JSON');
  });

  it('rejects with EventListParseError when input does not match the schema', async () => {
    const input = JSON.stringify([{ name: 'Missing required fields' }]);
    const error = await parseEventListJSON(input).catch((e) => e);

    expect(error).toBeInstanceOf(EventListParseError);
    expect(error.message).toContain('does not match the schema');
    expect(error.issues).toBeDefined();
    expect(error.issues.length).toBeGreaterThan(0);
  });

  it('resolves with parsed event list for valid input', async () => {
    const input = JSON.stringify([validEvent]);
    const result = await parseEventListJSON(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Jazz Night');
    expect(result[0].location_address).toBe('901 Wharf St SW, Washington, DC 20024');
  });

  it('accepts an event with all optional fields omitted', async () => {
    const minimalEvent = {
      name: 'Jazz Night',
      tags: ['music'],
      source: 'Kramer Books',
    };
    const input = JSON.stringify([minimalEvent]);
    const result = await parseEventListJSON(input);

    expect(result).toHaveLength(1);
    expect(result[0].description).toBeUndefined();
    expect(result[0].date).toBeUndefined();
    expect(result[0].start_time).toBeUndefined();
    expect(result[0].end_time).toBeUndefined();
    expect(result[0].location_name).toBeUndefined();
    expect(result[0].location_address).toBeUndefined();
    expect(result[0].link).toBeUndefined();
  });
});

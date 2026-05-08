import { transformEventData } from './transform';
import { eventApiResponseFixture } from './fixtures';

describe('transformEventData', () => {
  it('maps all fields correctly', async () => {
    const result = await transformEventData([eventApiResponseFixture]);
    const event = result[0];

    expect(event.name).toBe(eventApiResponseFixture.title);
    expect(event.description).toBe(eventApiResponseFixture.summary);
    expect(event.date).toBe('2026-06-20');
    expect(event.start_time).toBe('18:00');
    expect(event.end_time).toBe('20:00');
    expect(event.link).toBe(`https://kramers.com/events/${eventApiResponseFixture.id}`);
    expect(event.tags).toEqual(['books', 'author_events']);
  });

  it('sets the address when location_text is "Kramers"', async () => {
    const result = await transformEventData([
      { ...eventApiResponseFixture, location_text: 'Kramers' },
    ]);

    expect(result[0].location!.address).toBe('1517 Connecticut Ave NW, Washington, DC 20036');
  });

  it('omits address when location_text is not "Kramers"', async () => {
    const result = await transformEventData([eventApiResponseFixture]);

    expect(result[0].location!.address).toBeUndefined();
  });

  it('omits start_time and end_time when absent', async () => {
    const { start_time, end_time, ...eventWithoutTimes } = eventApiResponseFixture;
    const result = await transformEventData([eventWithoutTimes]);

    expect(result[0].start_time).toBeUndefined();
    expect(result[0].end_time).toBeUndefined();
  });
});

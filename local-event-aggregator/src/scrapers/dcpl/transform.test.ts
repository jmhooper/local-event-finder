import { transformDCPLEvents } from './transform';
import { EventSource } from '@src/event';
import { dcplEventFixture } from './fixtures';

describe('transformDCPLEvents', () => {
  it('maps all fields correctly', () => {
    const [event] = transformDCPLEvents([dcplEventFixture]);

    expect(event.name).toBe(dcplEventFixture.title);
    expect(event.description).toBe(dcplEventFixture.description);
    expect(event.date).toBe('2026-06-20');
    expect(event.start_time).toBe('18:00');
    expect(event.end_time).toBe('20:00');
    expect(event.location_name).toBe(dcplEventFixture.location);
    expect(event.link).toBe(`https://dclibrary.libnet.info/event/${dcplEventFixture.id}`);
    expect(event.source).toBe(EventSource.DCPL);
  });

  it('sets location_address from the library address map', () => {
    const [event] = transformDCPLEvents([dcplEventFixture]);

    expect(event.location_address).toBe('901 G St NW, Washington, DC 20001');
  });

  it('leaves location_address undefined when the location is not in the map', () => {
    const [event] = transformDCPLEvents([{ ...dcplEventFixture, location: 'Some Other Library' }]);

    expect(event.location_address).toBeUndefined();
  });

  it('normalizes the DCPL tags and prepends the "library" tag', () => {
    const [event] = transformDCPLEvents([dcplEventFixture]);

    expect(event.tags).toEqual(['library', 'books_and_authors', 'adults']);
  });

  it('does not duplicate the "library" tag if it is already present', () => {
    const [event] = transformDCPLEvents([
      { ...dcplEventFixture, tagsArray: ['Library', 'Adults'] },
    ]);

    expect(event.tags).toEqual(['library', 'adults']);
  });
});

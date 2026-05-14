import { filterBusinessHoursEvents, filterEventsWithLLM } from './filter';
import { Event, EventSource } from '@src/event';
import * as chat from '@llm/chat';

const buildEvent = (overrides: Partial<Event> = {}): Event => ({
  name: 'Test Event',
  date: '2026-06-15',
  start_time: '12:00',
  end_time: '13:00',
  tags: ['library'],
  source: EventSource.DCPL,
  ...overrides,
});

describe('filterBusinessHoursEvents', () => {
  it('includes weekend events that start during business hours', () => {
    const event = buildEvent({ date: '2026-06-20', start_time: '12:00' });

    expect(filterBusinessHoursEvents([event])).toEqual([event]);
  });

  it('includes events on holidays that start during business hours', () => {
    const event = buildEvent({ date: '2026-12-25', start_time: '12:00' });

    expect(filterBusinessHoursEvents([event])).toEqual([event]);
  });

  it('excludes weekday events that start during business hours', () => {
    const event = buildEvent({ date: '2026-06-15', start_time: '12:00' });

    expect(filterBusinessHoursEvents([event])).toEqual([]);
  });

  it('includes weekday events that start before business hours', () => {
    const event = buildEvent({ date: '2026-06-15', start_time: '07:00' });

    expect(filterBusinessHoursEvents([event])).toEqual([event]);
  });

  it('includes weekday events that start after business hours', () => {
    const event = buildEvent({ date: '2026-06-15', start_time: '18:00' });

    expect(filterBusinessHoursEvents([event])).toEqual([event]);
  });

  it('includes events without a date', () => {
    const { date, ...rest } = buildEvent();
    const event = rest as Event;

    expect(filterBusinessHoursEvents([event])).toEqual([event]);
  });

  it('includes events without a start_time', () => {
    const { start_time, ...rest } = buildEvent();
    const event = rest as Event;

    expect(filterBusinessHoursEvents([event])).toEqual([event]);
  });
});

describe('filterEventsWithLLM', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls fetchChatCompletionWithFormatSchema and returns the events from the response', async () => {
    const events: Event[] = [buildEvent()];

    const spy = jest
      .spyOn(chat, 'fetchChatCompletionWithFormatSchema')
      .mockResolvedValue({ events });

    const result = await filterEventsWithLLM(events);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(result).toBe(events);
  });
});

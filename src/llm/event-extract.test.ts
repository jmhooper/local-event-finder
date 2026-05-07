import { extractEventDataWithLLM } from './event-extract';
import { EventSource, Event } from '@src/event';
import ModelName from '@llm/models';
import * as chat from '@llm/chat';

describe('extractEventDataWithLLM', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends a system prompt + markdown to the LLM and returns the parsed events', async () => {
    const events: Event[] = [
      {
        name: 'A reading',
        description: null,
        date: '2026-05-08',
        start_time: null,
        end_time: null,
        location: { name: null, address: null },
        link: null,
        tags: ['reading'],
        source: EventSource.KRAMER_BOOKS,
      },
    ];

    const spy = jest
      .spyOn(chat, 'fetchChatCompletionWithFormatSchema')
      .mockResolvedValue({ events });

    const result = await extractEventDataWithLLM(
      ModelName.HAIKU,
      '# Some markdown',
      EventSource.KRAMER_BOOKS
    );

    expect(result).toBe(events);

    const [model, messages, , schemaName] = spy.mock.calls[0];
    expect(model).toBe(ModelName.HAIKU);
    expect(schemaName).toBe('EventData');

    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain(EventSource.KRAMER_BOOKS);

    expect(messages[1].role).toBe('user');
    expect(messages[1].content).toContain('# Some markdown');
  });
});

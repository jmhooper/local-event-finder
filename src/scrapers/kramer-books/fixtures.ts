export const sessionApiResponseFixture = {
  session_id: 'abc123',
};

export const eventApiResponseFixture = {
  id: 123,
  title: 'Author Talk',
  description: 'An evening with the author.',
  summary: 'Book signing and Q&A.',
  date: '20260620',
  start_time: '18:00:00',
  end_time: '20:00:00',
  location_text: 'Kramer Books, Dupont Circle',
  category: { name: 'Author Events' },
};

export const eventsApiResponseFixture = {
  rows: [eventApiResponseFixture],
};

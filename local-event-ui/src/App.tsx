import { useEffect, useState } from 'react';
import { fetchEvents } from './api';
import type { LocalEvent } from './types';
import { EventList } from './components/EventList';

export function App() {
  const [events, setEvents] = useState<LocalEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="page">
      <header className="site-header">
        <div className="site-header-inner">
          <h1 className="site-logo">Local Events</h1>
          <p className="site-tagline">What's happening around town</p>
        </div>
      </header>
      <main className="site-main">
        {error && <div className="status status-error">Couldn't load events: {error}</div>}
        {!events && !error && <div className="status status-loading">Loading events…</div>}
        {events && <EventList events={events} />}
      </main>
      <footer className="site-footer">
        <p>Powered by local indie sources</p>
      </footer>
    </div>
  );
}

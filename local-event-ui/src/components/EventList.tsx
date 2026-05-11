import type { LocalEvent } from '../types';
import { EventCard } from './EventCard';

interface Props {
  events: LocalEvent[];
}

export function EventList({ events }: Props) {
  if (events.length === 0) {
    return <div className="status status-empty">No events found.</div>;
  }
  return (
    <ul className="event-list">
      {events.map((event, i) => (
        <li key={i} className="event-list-item">
          <EventCard event={event} />
        </li>
      ))}
    </ul>
  );
}

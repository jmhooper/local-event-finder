import dayjs from 'dayjs';
import type { LocalEvent } from '../types';
import { EventCard } from './EventCard';

interface Props {
  events: LocalEvent[];
}

interface Group {
  key: string;
  label: string;
  events: LocalEvent[];
}

function groupByDate(events: LocalEvent[]): Group[] {
  const groups: Group[] = [];
  for (const event of events) {
    const d = event.date ? dayjs(event.date) : null;
    const key = d && d.isValid() ? d.format('YYYY-MM-DD') : '';
    const label = d && d.isValid() ? d.format('dddd, MMMM D, YYYY') : 'Date to be announced';
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.events.push(event);
    } else {
      groups.push({ key, label, events: [event] });
    }
  }
  return groups;
}

export function EventList({ events }: Props) {
  if (events.length === 0) {
    return <div className="status status-empty">No events found.</div>;
  }
  const groups = groupByDate(events);
  return (
    <div className="event-list">
      {groups.map((group) => (
        <section key={group.key || 'undated'} className="event-date-group">
          <h2 className="event-date-header">{group.label}</h2>
          <ul className="event-date-group-list">
            {group.events.map((event, i) => (
              <li key={i} className="event-list-item">
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

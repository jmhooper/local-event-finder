import dayjs from 'dayjs';
import type { LocalEvent } from '../types';

interface Props {
  event: LocalEvent;
}

function formatDate(date: string | undefined): string | null {
  if (!date) return null;
  const d = dayjs(date);
  return d.isValid() ? d.format('dddd, MMMM D, YYYY') : null;
}

function formatTime(time: string | undefined): string | null {
  if (!time) return null;
  const t = dayjs(`2000-01-01T${time}`);
  return t.isValid() ? t.format('h:mm A') : null;
}

function formatTimeRange(start: string | undefined, end: string | undefined): string | null {
  const s = formatTime(start);
  const e = formatTime(end);
  if (s && e) return `${s} – ${e}`;
  if (s) return s;
  if (e) return `Ends ${e}`;
  return null;
}

export function EventCard({ event }: Props) {
  const date = formatDate(event.date);
  const time = formatTimeRange(event.start_time, event.end_time);
  const hasWhen = date || time;
  const hasWhere = event.location_name || event.location_address;

  return (
    <article className="event-card">
      <header className="event-card-head">
        <h2 className="event-name">
          {event.link ? (
            <a href={event.link} target="_blank" rel="noopener noreferrer">
              {event.name}
            </a>
          ) : (
            event.name
          )}
        </h2>
        <span className="event-source">{event.source}</span>
      </header>

      {hasWhen && (
        <div className="event-when">
          {date && <span className="event-date">{date}</span>}
          {date && time && <span className="event-when-sep"> · </span>}
          {time && <span className="event-time">{time}</span>}
        </div>
      )}

      {hasWhere && (
        <div className="event-where">
          {event.location_name && <span className="event-location-name">{event.location_name}</span>}
          {event.location_name && event.location_address && <span className="event-where-sep"> — </span>}
          {event.location_address && <span className="event-location-address">{event.location_address}</span>}
        </div>
      )}

      {event.description && <p className="event-description">{event.description}</p>}

      {event.tags.length > 0 && (
        <ul className="event-tags">
          {event.tags.map((tag) => (
            <li key={tag} className="event-tag">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

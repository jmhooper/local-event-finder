import type { LocalEvent } from './types';

export async function fetchEvents(): Promise<LocalEvent[]> {
  const res = await fetch('/api/events');
  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

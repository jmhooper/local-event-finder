export interface LocalEvent {
  name: string;
  description?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  location_name?: string;
  location_address?: string;
  link?: string;
  tags: string[];
  source: string;
}

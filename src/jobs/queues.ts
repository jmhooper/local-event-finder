import { EventSource } from '@src/event';
import { ScraperFunction } from '@scrapers/types';
import { scrapeKramerBooks } from '@scrapers/kramer-books';
import { scrapeLostCityBooks } from '@scrapers/lost-city-books';
import { scrape730DC } from '@scrapers/seven-thirty-dc';

export interface ScraperJob {
  jobName: string;
  source: EventSource;
  scraper: ScraperFunction;
  cron: string;
}

/**
 * Each scraper has its own pg-boss queue and cron schedule. Cadence is per
 * source: cheap scrapers run daily, LLM-backed scrapers run weekly.
 */
export const SCRAPER_JOBS: ScraperJob[] = [
  {
    jobName: 'scrape-kramer-books',
    source: EventSource.KRAMER_BOOKS,
    scraper: scrapeKramerBooks,
    cron: '0 6 * * *',
  },
  {
    jobName: 'scrape-lost-city-books',
    source: EventSource.LOST_CITY_BOOKS,
    scraper: scrapeLostCityBooks,
    cron: '0 6 * * 0',
  },
  {
    jobName: 'scrape-730dc',
    source: EventSource.SEVEN_THIRY_DC,
    scraper: scrape730DC,
    // The 730DC cron picks Thursday morning because 730DC publishes its roundup ~Wed 3pm ET.
    cron: '0 6 * * 4',
  },
];

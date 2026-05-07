process.loadEnvFile();

import { scrapeKramerBooks } from '@scrapers/kramer-books';
import { scrapeLostCityBooks } from '@scrapers/lost-city-books';
import { scrape730DC } from '@scrapers/seven-thirty-dc';

const SCRAPERS = {
  'kramer-books': scrapeKramerBooks,
  'lost-city-books': scrapeLostCityBooks,
  'seven-thirty-dc': scrape730DC,
};

type ScraperName = keyof typeof SCRAPERS;

const scraperName = process.argv[2] as ScraperName;

if (!scraperName || !(scraperName in SCRAPERS)) {
  console.error(
    `Unknown scraper: "${scraperName}". Available: ${Object.keys(SCRAPERS).join(', ')}`
  );
  process.exit(1);
}

const run = async () => {
  const events = await SCRAPERS[scraperName]();
  console.log(JSON.stringify(events, null, 2));
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

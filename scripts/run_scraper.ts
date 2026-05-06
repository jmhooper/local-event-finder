import { scrapeKramerBooks } from '@src/scrapers/kramer-books';

const SCRAPERS = {
  'kramer-books': scrapeKramerBooks,
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

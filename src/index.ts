process.loadEnvFile();

import { scrapeLostCityBooks } from './scrapers/lost-city-books';

scrapeLostCityBooks().then((c) => console.log(c));

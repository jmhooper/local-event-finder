import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * DateTime is Day.js with project plugins (customParseFormat, utc, timezone)
 * attached. Import this instead of `dayjs` directly.
 */
export const DateTime = dayjs;

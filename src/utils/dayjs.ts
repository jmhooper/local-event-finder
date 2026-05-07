import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/**
 * DateTime is a class that is Day.js with customer parse formats added.
 */
export const DateTime = dayjs;

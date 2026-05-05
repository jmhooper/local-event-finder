import { parseEventListJSON, EventList, EVENT_LIST_JSON_SCHEMA } from './event';

const input = '{ "broken": "json" }';

parseEventListJSON(input).then((result) => {
  console.log(result);
});

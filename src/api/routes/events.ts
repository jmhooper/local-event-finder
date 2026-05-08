import { Router } from 'express';
import { getLatestEvents } from '@src/api/queries/events';

export const eventsRouter = Router();

eventsRouter.get('/', async (_req, res) => {
  const events = await getLatestEvents();
  res.json(events);
});

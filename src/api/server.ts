import express, { type ErrorRequestHandler } from 'express';
import expressWinston from 'express-winston';
import logger from '@src/logger';
import { eventsRouter } from '@src/api/routes/events';
import { healthRouter } from '@src/api/routes/health';

export const createServer = () => {
  const app = express();
  app.use(express.json());

  app.use(
    expressWinston.logger({
      winstonInstance: logger,
      meta: false,
      msg: '{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
      colorize: false,
      ignoreRoute: (req) => req.url === '/health',
    })
  );

  app.use('/health', healthRouter);
  app.use('/events', eventsRouter);

  app.use(
    expressWinston.errorLogger({
      winstonInstance: logger,
      meta: false,
      msg: '{{err.message}}',
    })
  );

  const errorHandler: ErrorRequestHandler = (_err, _req, res, _next) => {
    res.status(500).json({ error: 'Internal server error' });
  };
  app.use(errorHandler);

  return app;
};

export const startServer = async () => {
  const port = Number(process.env.PORT ?? 3000);
  const app = createServer();
  return new Promise<ReturnType<typeof app.listen>>((resolve) => {
    const server = app.listen(port, () => {
      logger.info(`[api] Listening on port ${port}`);
      resolve(server);
    });
  });
};

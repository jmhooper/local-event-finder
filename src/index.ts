import '@src/load-env';

import { spawn } from 'node:child_process';
import logger from '@src/logger';
import prisma from '@src/db';
import { startServer } from '@src/api/server';
import { startScheduler } from '@src/jobs/scheduler';

/**
 * Applies any pending Prisma migrations by shelling out to the prisma CLI.
 * This runs on every boot so the schema is always in sync before the API or
 * the scheduler start writing to the database.
 */
const runMigrations = (): Promise<void> =>
  new Promise((resolve, reject) => {
    logger.info('[migrate] Running prisma migrate deploy');
    const child = spawn('npx', ['prisma', 'migrate', 'deploy'], {
      stdio: 'inherit',
      env: process.env,
    });
    child.on('exit', (code) => {
      if (code === 0) {
        logger.info('[migrate] Migrations up to date');
        resolve();
      } else {
        reject(new Error(`prisma migrate deploy exited with code ${code}`));
      }
    });
    child.on('error', reject);
  });

const main = async () => {
  await runMigrations();

  const [server, boss] = await Promise.all([startServer(), startScheduler()]);

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`[main] ${signal} received; shutting down`);
    await Promise.allSettled([
      new Promise<void>((resolve) => server.close(() => resolve())),
      boss.stop({ graceful: true }),
      prisma.$disconnect(),
    ]);
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

main().catch((err) => {
  const message = err instanceof Error ? (err.stack ?? err.message) : String(err);
  logger.error(`[main] Fatal: ${message}`);
  process.exit(1);
});

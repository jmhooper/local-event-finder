-- CreateTable
CREATE TABLE "scraper_runs" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "errored_at" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "scraper_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "run_id" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "date" TEXT,
    "start_time" TEXT,
    "end_time" TEXT,
    "location_name" TEXT,
    "location_address" TEXT,
    "link" TEXT,
    "tags" TEXT[],

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scraper_runs_source_finished_at_idx" ON "scraper_runs"("source", "finished_at");

-- CreateIndex
CREATE INDEX "events_run_id_idx" ON "events"("run_id");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "scraper_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

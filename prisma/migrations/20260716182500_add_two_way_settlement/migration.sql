-- Dua arah settlement: debitur submit, kreditur review, dan audit event.

CREATE TYPE "SettlementEventType" AS ENUM ('SUBMITTED', 'CANCELLED', 'CONFIRMED', 'REJECTED');

ALTER TABLE "settlements" ADD COLUMN "submittedAt" TIMESTAMP(3);

CREATE TABLE "settlement_events" (
    "id" UUID NOT NULL,
    "settlementId" UUID NOT NULL,
    "actorMemberId" UUID NOT NULL,
    "type" "SettlementEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settlement_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "settlement_events_settlementId_createdAt_idx"
ON "settlement_events"("settlementId", "createdAt");

CREATE INDEX "settlement_events_actorMemberId_idx"
ON "settlement_events"("actorMemberId");

ALTER TABLE "settlement_events"
ADD CONSTRAINT "settlement_events_settlementId_fkey"
FOREIGN KEY ("settlementId") REFERENCES "settlements"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "settlement_events"
ADD CONSTRAINT "settlement_events_actorMemberId_fkey"
FOREIGN KEY ("actorMemberId") REFERENCES "trip_members"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."settlement_events" ENABLE ROW LEVEL SECURITY;

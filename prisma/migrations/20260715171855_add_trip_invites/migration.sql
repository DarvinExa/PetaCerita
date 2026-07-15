-- CreateTable
CREATE TABLE "trip_invites" (
    "id" UUID NOT NULL,
    "tripId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdById" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trip_invites_tripId_key" ON "trip_invites"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "trip_invites_token_key" ON "trip_invites"("token");

-- CreateIndex
CREATE UNIQUE INDEX "trip_invites_tokenHash_key" ON "trip_invites"("tokenHash");

-- CreateIndex
CREATE INDEX "trip_invites_tripId_idx" ON "trip_invites"("tripId");

-- AddForeignKey
ALTER TABLE "trip_invites" ADD CONSTRAINT "trip_invites_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

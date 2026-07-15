-- CreateEnum
CREATE TYPE "TripRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "JoinMethod" AS ENUM ('OWNER', 'INVITE_LINK');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "coverUrl" TEXT,
    "baseCurrency" TEXT NOT NULL DEFAULT 'IDR',
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_members" (
    "id" UUID NOT NULL,
    "tripId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "TripRole" NOT NULL DEFAULT 'MEMBER',
    "joinedVia" "JoinMethod" NOT NULL DEFAULT 'INVITE_LINK',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "days" (
    "id" UUID NOT NULL,
    "tripId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "trips_ownerId_idx" ON "trips"("ownerId");

-- CreateIndex
CREATE INDEX "trip_members_userId_idx" ON "trip_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "trip_members_tripId_userId_key" ON "trip_members"("tripId", "userId");

-- CreateIndex
CREATE INDEX "days_tripId_order_idx" ON "days"("tripId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "days_tripId_date_key" ON "days"("tripId", "date");

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_members" ADD CONSTRAINT "trip_members_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_members" ADD CONSTRAINT "trip_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "days" ADD CONSTRAINT "days_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

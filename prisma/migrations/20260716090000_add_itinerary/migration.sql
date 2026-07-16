-- CreateEnum
CREATE TYPE "ItineraryCategory" AS ENUM ('ALAM', 'ENTERTAIN', 'KULINER', 'PENGINAPAN', 'TRANSPORT');

-- CreateTable
CREATE TABLE "places" (
    "id" UUID NOT NULL,
    "tripId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ItineraryCategory" NOT NULL,
    "address" TEXT,
    "note" TEXT,
    "googlePlaceId" TEXT,
    "rating" DOUBLE PRECISION,
    "photoUrls" TEXT[],
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary_items" (
    "id" UUID NOT NULL,
    "tripId" UUID NOT NULL,
    "dayId" UUID,
    "placeId" UUID NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "category" "ItineraryCategory" NOT NULL,
    "note" TEXT,
    "estimatedCost" INTEGER,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itinerary_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "places_tripId_idx" ON "places"("tripId");

-- CreateIndex
CREATE INDEX "itinerary_items_tripId_idx" ON "itinerary_items"("tripId");

-- CreateIndex
CREATE INDEX "itinerary_items_dayId_order_idx" ON "itinerary_items"("dayId", "order");

-- CreateIndex
CREATE INDEX "itinerary_items_placeId_idx" ON "itinerary_items"("placeId");

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "days"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

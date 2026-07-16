-- Preserve the Google Maps link entered by the user so every map action can
-- return to the exact place listing, including its photos and reviews.
ALTER TABLE "public"."places"
ADD COLUMN "googleMapsUrl" TEXT;

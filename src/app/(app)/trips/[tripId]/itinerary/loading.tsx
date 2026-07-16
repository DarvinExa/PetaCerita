import { LoadingBlock } from "@/components/ui/feedback";

/** Loading khusus halaman itinerary. */
export default function ItineraryLoading() {
  return (
    <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-16">
      <LoadingBlock label="Memuat itinerary" />
    </div>
  );
}

import { LoadingBlock } from "@/components/ui/feedback";

/** Fallback loading untuk seluruh area terautentikasi saat data sedang dimuat. */
export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-16">
      <LoadingBlock />
    </div>
  );
}

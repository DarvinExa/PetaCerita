export default function TripDetailLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Memuat detail perjalanan</span>
      <div className="animate-pulse motion-reduce:animate-none" aria-hidden>
        <div className="mb-4 h-5 w-36 rounded bg-neutral-200" />
        <div className="mb-8 doodle-box border border-teal-100 bg-white p-5 sm:p-7">
          <div className="h-3 w-32 rounded bg-teal-100" />
          <div className="mt-4 h-8 w-2/3 max-w-md rounded bg-neutral-200" />
          <div className="mt-4 h-4 w-1/2 max-w-sm rounded bg-neutral-100" />
          <div className="mt-6 flex gap-2">
            <div className="h-11 w-36 doodle-sticker bg-neutral-200" />
            <div className="h-11 w-32 doodle-sticker bg-neutral-100" />
          </div>
        </div>
        <div className="mb-3 h-4 w-44 rounded bg-neutral-200" />
        <div className="flex flex-col gap-4">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="h-32 doodle-box border border-white/70 bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

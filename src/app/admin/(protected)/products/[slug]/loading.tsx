export default function LoadingProductEditor() {
  return (
    <section className="flex flex-col items-center max-w-6xl mx-auto space-y-6 text-stone-700 px-4 py-6">
      <div className="flex w-full max-w-2xl items-center justify-between animate-pulse">
        <div className="h-7 w-48 rounded bg-stone-200" />
        <div className="h-4 w-24 rounded bg-stone-200" />
      </div>

      <div className="w-full max-w-2xl space-y-6">
        <div className="grid gap-4 md:grid-cols-2 animate-pulse">
          <div className="h-14 rounded-md bg-stone-200" />
          <div className="h-14 rounded-md bg-stone-200" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 animate-pulse">
          <div className="h-14 rounded-md bg-stone-200" />
          <div className="h-10 self-center rounded bg-stone-200" />
        </div>

        <div className="space-y-4 animate-pulse">
          <div className="h-14 rounded-md bg-stone-200" />
          <div className="h-32 rounded-md bg-stone-200" />
        </div>

        <div className="space-y-3 animate-pulse">
          <div className="h-5 w-36 rounded bg-stone-200" />
          <div className="h-32 rounded-md bg-stone-100" />
        </div>

        <div className="space-y-3 animate-pulse">
          <div className="h-5 w-32 rounded bg-stone-200" />
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="h-14 rounded-md bg-stone-200" />
            <div className="h-16 w-16 rounded-md bg-stone-200" />
          </div>
          <div className="h-24 rounded-md bg-stone-100" />
        </div>

        <div className="h-9 w-32 rounded bg-rose-200 animate-pulse" />
      </div>
    </section>
  );
}
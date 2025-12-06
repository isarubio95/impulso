export default function LoadingProductoPage() {
  return (
    <section className="bg-stone-50 py-16 px-4">
      <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-200 animate-pulse" />
        <div className="flex flex-col gap-4">
          <div className="h-8 w-3/4 rounded bg-stone-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-stone-200 animate-pulse" />
            <div className="h-4 w-11/12 rounded bg-stone-200 animate-pulse" />
            <div className="h-4 w-10/12 rounded bg-stone-200 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-stone-200 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-1/4 rounded bg-stone-200 animate-pulse" />
            <div className="h-4 w-10/12 rounded bg-stone-100" />
            <div className="h-4 w-9/12 rounded bg-stone-100" />
            <div className="h-4 w-6/12 rounded bg-stone-100" />
          </div>
          <div className="h-6 w-32 rounded bg-stone-200 animate-pulse" />
          <div className="h-4 w-24 rounded bg-stone-200 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
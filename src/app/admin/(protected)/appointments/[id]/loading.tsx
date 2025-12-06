export default function LoadingAppointmentEditor() {
  return (
    <section className="max-w-2xl mx-auto space-y-6 text-stone-700 px-4 py-6">
      <div className="flex items-center justify-between animate-pulse">
        <div className="h-7 w-40 rounded bg-stone-200" />
        <div className="h-4 w-28 rounded bg-stone-200" />
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 animate-pulse">
          <div className="h-14 rounded-md bg-stone-200" />
          <div className="h-14 rounded-md bg-stone-200" />
          <div className="h-14 rounded-md bg-stone-200" />
          <div className="h-14 rounded-md bg-stone-200" />
        </div>

        <div className="grid gap-4 md:grid-cols-3 animate-pulse">
          <div className="h-14 rounded-md bg-stone-200" />
          <div className="h-14 rounded-md bg-stone-200" />
          <div className="h-14 rounded-md bg-stone-200" />
        </div>

        <div className="h-14 rounded-md bg-stone-200 animate-pulse" />

        <div className="h-9 w-36 rounded bg-rose-200 animate-pulse" />
      </div>
    </section>
  );
}
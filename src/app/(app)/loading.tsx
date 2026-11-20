export default function Loading() {
  return (
    <div className="animate-pulse" aria-label="Loading page">
      <div className="mb-7 space-y-3">
        <div className="h-3 w-28 rounded-full bg-line" />
        <div className="h-8 w-52 rounded-lg bg-line" />
        <div className="h-4 w-72 max-w-full rounded-full bg-line" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="soft-card h-36 p-5">
            <div className="size-10 rounded-xl bg-line" />
            <div className="mt-5 h-3 w-20 rounded-full bg-line" />
            <div className="mt-2 h-7 w-28 rounded-lg bg-line" />
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="soft-card h-72 p-6">
          <div className="h-4 w-32 rounded-full bg-line" />
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-16 rounded-2xl bg-line/60" />
            ))}
          </div>
        </div>
        <div className="soft-card h-72 p-6">
          <div className="h-4 w-36 rounded-full bg-line" />
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-14 rounded-2xl bg-line/60" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

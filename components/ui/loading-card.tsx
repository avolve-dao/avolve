interface LoadingCardProps {
  count?: number
}

export function LoadingCard({ count = 1 }: LoadingCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm"
        >
          <div className="space-y-3">
            <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-800" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default function CatererCardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="h-44 shimmer" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded shimmer" />
            <div className="h-3 w-20 rounded shimmer" />
          </div>
          <div className="h-8 w-16 rounded shimmer" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-16 rounded-full shimmer" />
          <div className="h-5 w-20 rounded-full shimmer" />
          <div className="h-5 w-14 rounded-full shimmer" />
        </div>
        <div className="flex justify-between pt-3 border-t border-white/5">
          <div className="h-3 w-24 rounded shimmer" />
          <div className="h-3 w-20 rounded shimmer" />
        </div>
      </div>
    </div>
  )
}

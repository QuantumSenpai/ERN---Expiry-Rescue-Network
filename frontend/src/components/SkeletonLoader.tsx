interface SkeletonLoaderProps {
  type?: "card" | "text" | "stat";
  count?: number;
  className?: string;
}

export default function SkeletonLoader({
  type = "card",
  count = 3,
  className = "",
}: SkeletonLoaderProps) {
  const items = Array.from({ length: count });

  if (type === "card") {
    return (
      <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#170A2C]/60 border border-[#F0E9D3]/10 overflow-hidden p-5 flex flex-col gap-4"
          >
            <div className="aspect-[16/10] w-full rounded-xl ern-skeleton opacity-60" />
            <div className="h-5 w-3/4 rounded-md ern-skeleton opacity-60" />
            <div className="h-4 w-1/2 rounded-md ern-skeleton opacity-40" />
            <div className="mt-4 pt-3 border-t border-[#F0E9D3]/10 flex justify-between items-center">
              <div className="h-6 w-20 rounded-md ern-skeleton opacity-60" />
              <div className="h-4 w-16 rounded-md ern-skeleton opacity-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "stat") {
    return (
      <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-[#170A2C]/60 border border-[#F0E9D3]/10 flex flex-col gap-3"
          >
            <div className="size-11 rounded-xl ern-skeleton opacity-60" />
            <div className="h-8 w-28 rounded-md ern-skeleton opacity-70" />
            <div className="h-4 w-20 rounded-md ern-skeleton opacity-50" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="h-4 w-full rounded-md ern-skeleton opacity-60" />
      ))}
    </div>
  );
}

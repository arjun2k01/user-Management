// src/components/Users/StatsSkeleton.jsx
import Skeleton from "../common/Skeleton";

const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-950/80 p-3 shadow-sm"
        >
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </div>
  );
};

export default StatsSkeleton;

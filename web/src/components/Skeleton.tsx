'use client';

interface SkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

export default function Skeleton({ className = '', lines = 3, avatar = false }: SkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {avatar && (
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary-200/50 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-primary-200/50 rounded w-1/3" />
            <div className="h-3 bg-primary-200/30 rounded w-1/2" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-primary-200/50 rounded"
            style={{ width: i === lines - 1 ? '60%' : '100%' }}
          />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary-200/50 rounded-2xl" />
        <div className="space-y-2">
          <div className="h-8 bg-primary-200/50 rounded w-48" />
          <div className="h-4 bg-primary-200/30 rounded w-32" />
        </div>
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white/60 rounded-2xl p-4 space-y-3">
            <div className="h-4 bg-primary-200/30 rounded w-16" />
            <div className="h-8 bg-primary-200/50 rounded w-12" />
            <div className="h-3 bg-primary-200/30 rounded w-20" />
          </div>
        ))}
      </div>
      {/* Content skeleton */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white/60 rounded-2xl p-6 space-y-4">
          <div className="h-5 bg-primary-200/50 rounded w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-primary-200/30 rounded-xl" />
          ))}
        </div>
        <div className="bg-white/60 rounded-2xl p-6 space-y-4">
          <div className="h-5 bg-primary-200/50 rounded w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-primary-200/30 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

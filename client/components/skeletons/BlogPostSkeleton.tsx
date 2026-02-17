import React from "react";
import { Skeleton } from "@heroui/skeleton";

export default function BlogPostSkeleton() {
  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumbs skeleton */}
      <Skeleton className="w-48 rounded-lg mb-6">
        <div className="h-5 w-48 rounded-lg bg-default-200" />
      </Skeleton>

      <header className="mb-8">
        {/* Category / date / views skeleton */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Skeleton className="w-24 rounded-full">
            <div className="h-7 w-24 rounded-full bg-default-200" />
          </Skeleton>
          <Skeleton className="w-40 rounded-lg">
            <div className="h-5 w-40 rounded-lg bg-default-200" />
          </Skeleton>
          <Skeleton className="w-20 rounded-lg">
            <div className="h-5 w-20 rounded-lg bg-default-200" />
          </Skeleton>
        </div>

        {/* Title skeleton */}
        <Skeleton className="w-full rounded-lg mb-2">
          <div className="h-10 w-full rounded-lg bg-default-300" />
        </Skeleton>
        <Skeleton className="w-3/4 rounded-lg mb-6">
          <div className="h-10 w-3/4 rounded-lg bg-default-300" />
        </Skeleton>

        {/* Featured image skeleton */}
        <Skeleton className="rounded-xl mb-8">
          <div className="h-[400px] w-full rounded-xl bg-default-300" />
        </Skeleton>
      </header>

      {/* Content skeleton */}
      <div className="space-y-3">
        {[100, 95, 88, 100, 92, 85, 97, 90].map((w, i) => (
          <Skeleton key={i} className="w-full rounded-lg">
            <div
              className="h-4 rounded-lg bg-default-200"
              style={{ width: `${w}%` }}
            />
          </Skeleton>
        ))}
      </div>
    </article>
  );
}

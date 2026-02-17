"use client";

import React from "react";

import BlogCardSkeleton from "@/components/skeletons/BlogCardSkeleton";
import { BlogCard } from "@/components/BlogCard";
import { usePublicPosts } from "@/hooks/usePosts";

export default function BlogListClient() {
  const { data, isLoading } = usePublicPosts();
  const posts = data ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-default-400">
          No posts available yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}

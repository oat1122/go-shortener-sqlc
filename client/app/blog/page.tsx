"use client";

import React from "react";

import { BlogCard } from "@/components/BlogCard";
import { usePublicPosts } from "@/hooks/usePosts";

export default function BlogPage() {
  const { data: posts = [], isLoading } = usePublicPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Our Blog</h1>
        <p className="text-default-500 max-w-2xl mx-auto">
          Discover the latest insights, tutorials, and news about URL
          shortening, QR codes, and digital marketing strategies.
        </p>
      </header>

      {isLoading ? (
        <div className="text-center py-20">
          <p className="text-xl text-default-400">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-default-400">
            No posts available yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

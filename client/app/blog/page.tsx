import React from "react";
import { Metadata } from "next";
import { Post } from "@/types/blog";
import { BlogCard } from "@/components/BlogCard";

export const metadata: Metadata = {
  title: "Blog - URL Shortener & QR Code Generator",
  description:
    "Read our latest articles about SEO, Digital Marketing, and Technology.",
};

async function getPosts(): Promise<Post[]> {
  try {
    // In a real production app, use an environment variable for the API base URL
    // For now, assuming localhost:8080 or wherever the Go server runs
    // During build time (SSG), this might fail if the server isn't running, so we might need ISR or client-side fetch.
    // However, "Plan Be" implies a robust plan. Let's use `fetch` with `next: { revalidate: 60 }` for ISR.

    // Note: This requires the Go server to be accessible.
    // If running in Docker compose, use service name. If local, use localhost.
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error("Failed to fetch posts:", res.statusText);
      return [];
    }

    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Our Blog</h1>
        <p className="text-default-500 max-w-2xl mx-auto">
          Discover the latest insights, tutorials, and news about URL
          shortening, QR codes, and digital marketing strategies.
        </p>
      </header>

      {posts.length === 0 ? (
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

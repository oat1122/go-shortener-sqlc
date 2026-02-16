import React from "react";
import { Metadata } from "next";

import BlogPostClient from "./BlogPostClient";

import { Post } from "@/types/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Keep server-side fetch for Metadata (SEO)
async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${slug}`,
      {
        next: { revalidate: 60 },
        cache: "no-store",
      },
    );

    if (!res.ok) return null;

    return res.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching post for metadata:", error);

    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} - Blog`,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.meta_description || post.excerpt,
      images: post.featured_image ? [post.featured_image] : [],
      type: "article",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: ["Admin"],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  return <BlogPostClient slug={slug} />;
}

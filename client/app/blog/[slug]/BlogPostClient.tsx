"use client";

import React from "react";
import { Image } from "@heroui/image";
import { Calendar, Eye, Folder } from "lucide-react";

import { usePublicPost } from "@/hooks/usePosts";

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const { data: post, isLoading } = usePublicPost(slug);

  if (isLoading) {
    return <div className="text-center py-20">Loading post...</div>;
  }

  if (!post) {
    return <div className="text-center py-20">Post not found</div>;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.featured_image ? [post.featured_image] : [],
    datePublished: post.published_at,
    dateModified: post.updated_at,
    description: post.meta_description || post.excerpt,
    articleBody: post.content,
    author: {
      "@type": "Person",
      name: "Admin",
    },
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />

      <header className="mb-8">
        <div className="flex gap-2 mb-4 text-sm text-default-500 flex-wrap">
          {post.category_name && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full">
              <Folder size={14} />
              <span>{post.category_name}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(post.published_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{post.views} Views</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
          {post.title}
        </h1>

        {post.featured_image && (
          <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden shadow-lg">
            <Image
              alt={post.title}
              className="w-full h-full object-cover"
              src={post.featured_image}
            />
          </div>
        )}
      </header>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div className="whitespace-pre-wrap">{post.content}</div>
      </div>
    </article>
  );
}

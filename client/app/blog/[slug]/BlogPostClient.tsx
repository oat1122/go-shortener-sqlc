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

  const getString = (val: unknown): string => {
    if (typeof val === "string") return val;
    if (val && typeof val === "object" && "String" in val) {
      return (val as { String: string }).String || "";
    }
    return "";
  };

  if (isLoading) {
    return <div className="text-center py-20">Loading post...</div>;
  }

  if (!post) {
    return <div className="text-center py-20">Post not found</div>;
  }

  const title = getString(post.title);
  const content = getString(post.content);
  const excerpt = getString(post.excerpt);
  const metaDescription = getString(post.meta_description);
  const featuredImage = getString(post.featured_image);
  const categoryName = getString(post.category_name);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    image: featuredImage ? [featuredImage] : [],
    datePublished: post.published_at,
    dateModified: post.updated_at,
    description: metaDescription || excerpt,
    articleBody: content,
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
          {categoryName && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full">
              <Folder size={14} />
              <span>{categoryName}</span>
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
          {title}
        </h1>

        {featuredImage && (
          <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden shadow-lg">
            <Image
              alt={title}
              className="w-full h-full object-cover"
              src={featuredImage}
            />
          </div>
        )}
      </header>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </article>
  );
}

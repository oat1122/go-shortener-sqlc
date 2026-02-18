"use client";

import React from "react";
import Link from "next/link";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Calendar, Eye, Folder, Home } from "lucide-react";
import { Image as HeroImage } from "@heroui/image";

import BlogPostSkeleton from "@/components/skeletons/BlogPostSkeleton";
import { usePublicPost } from "@/hooks/usePosts";
import { useImage } from "@/hooks/useImages";

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const { data: post, isLoading } = usePublicPost(slug);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const getString = (val: unknown): string => {
    if (typeof val === "string") return val;
    if (val && typeof val === "object" && "String" in val) {
      return (val as { String: string }).String || "";
    }

    return "";
  };

  // Extract image ID before early returns so useImage hook is always called
  const featuredImageId = getString(post?.featured_image);
  const { data: imageData } = useImage(featuredImageId);
  const featuredImageUrl = imageData
    ? `${apiUrl}${imageData.urls.original}`
    : undefined;

  if (isLoading) {
    return <BlogPostSkeleton />;
  }

  if (!post) {
    return <div className="text-center py-20">Post not found</div>;
  }

  const title = getString(post.title);
  const content = getString(post.content);
  const excerpt = getString(post.excerpt);
  const metaDescription = getString(post.meta_description);
  const categoryName = getString(post.category_name);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    image: featuredImageUrl ? [featuredImageUrl] : [],
    datePublished: post.published_at,
    dateModified: post.updated_at,
    description: metaDescription || excerpt,
    articleBody: content,
    author: {
      "@type": "Person",
      name: "Admin",
    },
  };

  // Helper to extract date string from sql.NullTime object or plain string
  const getDateString = (val: unknown): string => {
    if (typeof val === "string") return val;
    if (val && typeof val === "object" && "Time" in val && "Valid" in val) {
      const nullTime = val as { Time: string; Valid: boolean };

      if (nullTime.Valid) return nullTime.Time;
    }

    return "";
  };

  const formatDate = (dateVal?: unknown) => {
    const dateString = getDateString(dateVal);

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

      {/* Breadcrumbs */}
      <Breadcrumbs className="mb-6" size="lg" variant="solid">
        <BreadcrumbItem startContent={<Home size={16} />}>
          <Link href="/blog">Blog</Link>
        </BreadcrumbItem>
        {categoryName && (
          <BreadcrumbItem>
            <span>{categoryName}</span>
          </BreadcrumbItem>
        )}
        <BreadcrumbItem isCurrent>
          <span className="line-clamp-1 max-w-[200px] md:max-w-[400px]">
            {title}
          </span>
        </BreadcrumbItem>
      </Breadcrumbs>

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
            <span>
              {formatDate(post.published_at) || formatDate(post.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{post.views} Views</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
          {title}
        </h1>

        {featuredImageUrl && (
          <div className="relative w-full mb-8 rounded-xl overflow-hidden shadow-lg">
            <HeroImage
              alt={title}
              className="w-full h-full object-cover"
              src={featuredImageUrl}
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

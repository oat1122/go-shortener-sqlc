import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Post } from "@/types/blog";
import { Calendar, Eye, Tag as TagIcon, Folder } from "lucide-react";

interface PageProps {
  params: { slug: string };
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${slug}`,
      {
        next: { revalidate: 60 },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      if (res.status === 404) return null;
      console.error("Failed to fetch post:", res.statusText);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const post = await getPost(params.slug);

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
      authors: ["Admin"], // Add dynamic author if available
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.featured_image ? [post.featured_image] : [],
    datePublished: post.published_at,
    dateModified: post.updated_at,
    description: post.meta_description || post.excerpt,
    articleBody: post.content, // Warning: This might be too long for JSON-LD in some cases, consider truncating
    author: {
      "@type": "Person",
      name: "Admin", // Todo: Dynamic author
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
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </header>

      {/* Content Rendering: For now, we assume simple text or HTML if trusted. 
          If using Markdown, we would need a parser here. 
          For Plan Be, let's assume it renders raw HTML (dangerous if not sanitized) OR just whitespace-preserved text. 
          Let's use a simple whitespace preserver div for MVP.
      */}
      <div className="prose prose-lg max-w-none dark:prose-invert">
        {/* 
            Security Note: If content is HTML, use dangerouslySetInnerHTML with sanitization (e.g., dompurify).
            If Markdown, use react-markdown. 
            For this demo, we'll display as text with line breaks to be safe.
          */}
        <div className="whitespace-pre-wrap">{post.content}</div>
      </div>

      {/* Tags Footer */}
      <div className="mt-12 pt-6 border-t border-divider">
        <div className="flex gap-2 flex-wrap">
          {/* 
                   Note: We need to fetch tags for this post separately or included in the post response.
                   The current GetPostBySlug response might not include tags array unless we update the query.
                   The Plan included `post_tags` table. 
                   For now, we will skip tags display here until we update the backend to returning them in the same payload, 
                   request them separately.
                */}
        </div>
      </div>
    </article>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Calendar, Eye } from "lucide-react";

import { Post } from "@/types/blog";
import { useImage } from "@/hooks/useImages";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1499750310159-57f0f294794c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

interface BlogCardProps {
  post: Post;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
    });
  };

  const getString = (val: any): string => {
    if (typeof val === "string") return val;
    if (val && typeof val === "object" && "String" in val) {
      return val.String || "";
    }

    return "";
  };

  const title = getString(post.title);
  const excerpt = getString(post.excerpt);
  const content = getString(post.content);
  const featuredImageId = getString(post.featured_image);

  // Resolve Image ID to URL
  const { data: imageData } = useImage(featuredImageId);
  const imageUrl = imageData
    ? `${apiUrl}${imageData.urls.medium}`
    : featuredImageId
      ? undefined // still loading
      : PLACEHOLDER_IMAGE;

  return (
    <Card
      isPressable
      className="h-full hover:scale-[1.02] transition-transform"
      shadow="sm"
    >
      <Link className="w-full h-full" href={`/blog/${getString(post.slug)}`}>
        <CardBody className="overflow-visible p-0">
          <Image
            alt={title}
            className="w-full object-cover h-[200px]"
            radius="lg"
            shadow="sm"
            src={imageUrl || PLACEHOLDER_IMAGE}
            width="100%"
          />
        </CardBody>
        <CardFooter className="text-small justify-between flex-col items-start gap-2">
          <div className="flex justify-between w-full items-center text-default-500">
            {post.category_name && (
              <span className="text-tiny uppercase font-bold text-primary">
                {post.category_name}
              </span>
            )}
            <div className="flex gap-1 items-center">
              <Eye size={14} />
              <span>{post.views}</span>
            </div>
          </div>
          <b className="text-lg line-clamp-2">{title}</b>
          <p className="text-default-500 line-clamp-3">
            {excerpt || content.substring(0, 100)}...
          </p>
          <div className="flex gap-2 items-center text-default-400 mt-2">
            <Calendar size={14} />
            <span>
              {formatDate(post.published_at) || formatDate(post.created_at)}
            </span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

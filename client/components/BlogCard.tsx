"use client";

import React from "react";
import Link from "next/link";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Post } from "@/types/blog";
import { Calendar, Eye } from "lucide-react";

interface BlogCardProps {
  post: Post;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card
      shadow="sm"
      className="h-full hover:scale-[1.02] transition-transform"
      isPressable
    >
      <Link href={`/blog/${post.slug}`} className="w-full h-full">
        <CardBody className="overflow-visible p-0">
          <Image
            shadow="sm"
            radius="lg"
            width="100%"
            alt={post.title}
            className="w-full object-cover h-[200px]"
            src={
              post.featured_image ||
              "https://images.unsplash.com/photo-1499750310159-57f0f294794c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            }
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
          <b className="text-lg line-clamp-2">{post.title}</b>
          <p className="text-default-500 line-clamp-3">
            {post.excerpt || post.content.substring(0, 100)}...
          </p>
          <div className="flex gap-2 items-center text-default-400 mt-2">
            <Calendar size={14} />
            <span>{formatDate(post.published_at)}</span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

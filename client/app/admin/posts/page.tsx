"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { Post } from "@/types/blog";
import { useRouter } from "next/navigation";

const statusColorMap: Record<string, "success" | "warning" | "default"> = {
  published: "success",
  draft: "warning",
  archived: "default",
};

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/posts`,
        {
          credentials: "include",
        },
      );
      if (res.ok) {
        const data = await res.json();
        setPosts(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/posts/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (res.ok) {
        setPosts(posts.filter((post) => post.id !== id));
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post", error);
    }
  };

  const renderCell = React.useCallback(
    (post: Post, columnKey: React.Key) => {
      const cellValue = post[columnKey as keyof Post];

      switch (columnKey) {
        case "title":
          return (
            <div className="flex flex-col">
              <span className="text-bold text-small capitalize">
                {post.title}
              </span>
              <span className="text-tiny text-default-400">/{post.slug}</span>
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[post.status]}
              size="sm"
              variant="flat"
            >
              {post.status}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="View">
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                    <Eye size={18} />
                  </span>
                </Link>
              </Tooltip>
              <Tooltip content="Edit">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <Edit size={18} />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Delete">
                <span
                  className="text-lg text-danger cursor-pointer active:opacity-50"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 size={18} />
                </span>
              </Tooltip>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [handleDelete],
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Posts Management</h1>
        <Link href="/admin/posts/create">
          <Button color="primary" startContent={<Plus size={20} />}>
            Create New Post
          </Button>
        </Link>
      </div>

      <Table aria-label="Example table with custom cells">
        <TableHeader>
          <TableColumn key="title">TITLE</TableColumn>
          <TableColumn key="status">STATUS</TableColumn>
          <TableColumn key="actions">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={posts}
          isLoading={loading}
          loadingContent={<div>Loading...</div>}
          emptyContent={"No posts found"}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

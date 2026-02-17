"use client";

import React from "react";
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
import { usePosts, useDeletePost } from "@/hooks/usePosts";

const statusColorMap: Record<string, "success" | "warning" | "default"> = {
  published: "success",
  draft: "warning",
  archived: "default",
};

export default function AdminPostsPage() {
  const { data, isLoading } = usePosts();
  const posts = data ?? [];
  const deleteMutation = useDeletePost();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error deleting post", error);
      alert("Failed to delete post");
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
                  <Button isIconOnly size="sm" variant="light">
                    <Eye className="text-default-400" size={18} />
                  </Button>
                </Link>
              </Tooltip>
              <Tooltip content="Edit">
                <Link href={`/admin/posts/${post.id}/edit`}>
                  <Button isIconOnly size="sm" variant="light">
                    <Edit className="text-default-400" size={18} />
                  </Button>
                </Link>
              </Tooltip>
              <Tooltip color="danger" content="Delete">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => handleDelete(post.id)}
                >
                  <Trash2 className="text-danger" size={18} />
                </Button>
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
          emptyContent={"No posts found"}
          isLoading={isLoading}
          items={posts}
          loadingContent={<div>Loading...</div>}
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

"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { Image } from "@heroui/image";
import { Save, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

import { PostStatus } from "@/types/blog";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { usePost, useUpdatePost } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: post, isLoading: isPostLoading } = usePost(id);
  const { data: categories = [] } = useCategories();
  const updateMutation = useUpdatePost();

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState<PostStatus>("draft");
  const [categoryId, setCategoryId] = useState("");

  // Helper to safely extract string from sql.NullString objects
  const getString = (val: unknown): string => {
    if (typeof val === "string") return val;
    if (val && typeof val === "object" && "String" in val) {
      return (val as { String: string }).String || "";
    }
    return "";
  };

  // Sync state with post data when loaded
  useEffect(() => {
    if (post) {
      setTitle(getString(post.title));
      setSlug(getString(post.slug));
      setContent(getString(post.content));
      setExcerpt(getString(post.excerpt));
      setFeaturedImage(getString(post.featured_image));
      setStatus(post.status);
      setCategoryId(getString(post.category_id));
    }
  }, [post]);

  const handleUpdate = async () => {
    try {
      const payload = {
        title,
        slug,
        content,
        excerpt,
        featured_image: featuredImage || "",
        status,
        category_id: categoryId,
        tags: [],
        meta_description: "",
        keywords: "",
        // published_at: new Date().toISOString(), // Optional, let server handle or zero value
      };

      await updateMutation.mutateAsync({
        id: id,
        data: payload,
      });

      router.push("/admin/posts");
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("Update Error:", error.response?.data || error);
      alert(
        `Failed to update post: ${error.response?.data?.error || "Unknown error"}`,
      );
    }
  };

  if (isPostLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!post)
    return (
      <div className="p-8 text-center">
        Post not found.{" "}
        <Link className="underline" href="/admin/posts">
          Go back
        </Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <Button isIconOnly size="sm" variant="light">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Post</h1>
        </div>
        <div className="flex gap-2">
          <Button
            color="primary"
            isLoading={updateMutation.isPending}
            startContent={<Save size={18} />}
            onPress={handleUpdate}
          >
            Update Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4">
            <CardBody className="gap-6">
              <Input
                isRequired
                classNames={{
                  input: "text-xl font-bold",
                }}
                label="Post Title"
                placeholder="Enter post title"
                size="lg"
                value={title}
                variant="bordered"
                onValueChange={setTitle}
              />

              <div>
                <p className="block text-small font-medium text-default-700 mb-2">
                  Content
                </p>
                <RichTextEditor content={content} onChange={setContent} />
              </div>

              <Textarea
                label="Excerpt"
                placeholder="Short summary for SEO and previews"
                value={excerpt}
                variant="bordered"
                onValueChange={setExcerpt}
              />
            </CardBody>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <Card className="p-4">
            <CardHeader className="font-semibold px-4 pt-4 pb-0">
              Publishing
            </CardHeader>
            <CardBody className="gap-4">
              <Select
                label="Status"
                selectedKeys={[status]}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
              >
                <SelectItem key="draft">Draft</SelectItem>
                <SelectItem key="published">Published</SelectItem>
                <SelectItem key="archived">Archived</SelectItem>
              </Select>

              <Input
                description={`http://.../blog/${slug}`}
                label="Slug URL"
                value={slug}
                onValueChange={setSlug}
              />
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader className="font-semibold px-4 pt-4 pb-0">
              Organization
            </CardHeader>
            <CardBody className="gap-4">
              <Select
                label="Category"
                selectedKeys={categoryId ? [categoryId] : []}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((cat) => (
                  <SelectItem key={cat.id}>{cat.name}</SelectItem>
                ))}
              </Select>
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader className="font-semibold px-4 pt-4 pb-0">
              Featured Image
            </CardHeader>
            <CardBody className="gap-4">
              {featuredImage ? (
                <div className="relative rounded-lg overflow-hidden aspect-video">
                  <Image
                    alt="Featured"
                    className="object-cover w-full h-full"
                    src={featuredImage}
                  />
                  <Button
                    className="absolute top-2 right-2 z-10"
                    color="danger"
                    size="sm"
                    variant="flat"
                    onPress={() => setFeaturedImage("")}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-default-300 rounded-lg p-8 flex flex-col items-center justify-center text-default-400 gap-2">
                  <Upload size={32} />
                  <span className="text-sm">Enter Image URL below</span>
                </div>
              )}
              <Input
                placeholder="https://example.com/image.jpg"
                startContent={
                  <span className="text-default-400 text-sm">URL:</span>
                }
                value={featuredImage}
                onValueChange={setFeaturedImage}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

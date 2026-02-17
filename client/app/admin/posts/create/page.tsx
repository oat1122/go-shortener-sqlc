"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

import RichTextEditor from "@/components/editor/RichTextEditor";
import ImagePicker from "@/components/ImagePicker";
import { useCreatePost } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { PostStatus } from "@/types/blog";

export default function CreatePostPage() {
  const router = useRouter();
  const createMutation = useCreatePost();
  const { data: categories = [] } = useCategories();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState(""); // Image ID (UUID)
  const [featuredImageUrl, setFeaturedImageUrl] = useState(""); // Resolved URL for preview
  const [status, setStatus] = useState<PostStatus>("draft");
  const [categoryId, setCategoryId] = useState("");

  // Auto-generate slug from title if slug is empty
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, ""),
      );
    }
  };

  const handleSubmit = async () => {
    try {
      await createMutation.mutateAsync({
        title,
        slug,
        content,
        excerpt,
        featured_image: featuredImage,
        status,
        category_id: categoryId,
      });

      router.push("/admin/posts");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      alert("Failed to create post");
    }
  };

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
          <h1 className="text-2xl font-bold">Create New Post</h1>
        </div>
        <div className="flex gap-2">
          <Button
            color="default"
            variant="flat"
            onPress={() => setStatus("draft")}
          >
            Save Draft
          </Button>
          <Button
            color="primary"
            isLoading={createMutation.isPending}
            startContent={<Save size={18} />}
            onPress={handleSubmit}
          >
            Publish
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
                onValueChange={handleTitleChange}
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
              {/* Todo: Tag input */}
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader className="font-semibold px-4 pt-4 pb-0">
              Featured Image
            </CardHeader>
            <CardBody className="gap-4">
              <ImagePicker
                previewUrl={featuredImageUrl}
                value={featuredImage}
                onClear={() => {
                  setFeaturedImage("");
                  setFeaturedImageUrl("");
                }}
                onSelect={(id, url) => {
                  setFeaturedImage(id);
                  setFeaturedImageUrl(url);
                }}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

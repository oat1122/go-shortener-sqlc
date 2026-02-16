"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Divider } from "@heroui/divider";
import { Image } from "@heroui/image";
import { Save, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { slugify } from "@/lib/utils"; // You might need to create this utility or just use a simple function
import { Category } from "@/types/blog";

export default function CreatePostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState("draft");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
        {
          credentials: "include",
        },
      );
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
      }
    } catch (e) {
      console.error("Failed to fetch categories");
    }
  };

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
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            slug,
            content,
            excerpt,
            featured_image: featuredImage,
            status,
            category_id: categoryId,
            // published_at: status === 'published' ? new Date().toISOString() : null,
          }),
          credentials: "include",
        },
      );

      if (!res.ok) throw new Error("Failed to create post");

      router.push("/admin/posts");
    } catch (error) {
      console.error(error);
      alert("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <Button isIconOnly variant="light" size="sm">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Create New Post</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            color="default"
            onPress={() => setStatus("draft")}
          >
            Save Draft
          </Button>
          <Button
            color="primary"
            startContent={<Save size={18} />}
            onPress={handleSubmit}
            isLoading={loading}
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
                label="Post Title"
                placeholder="Enter post title"
                variant="bordered"
                size="lg"
                value={title}
                onValueChange={handleTitleChange}
                isRequired
                classNames={{
                  input: "text-xl font-bold",
                }}
              />

              <div>
                <label className="block text-small font-medium text-default-700 mb-2">
                  Content
                </label>
                <RichTextEditor content={content} onChange={setContent} />
              </div>

              <Textarea
                label="Excerpt"
                placeholder="Short summary for SEO and previews"
                variant="bordered"
                value={excerpt}
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
                onChange={(e) => setStatus(e.target.value)}
              >
                <SelectItem key="draft">Draft</SelectItem>
                <SelectItem key="published">Published</SelectItem>
                <SelectItem key="archived">Archived</SelectItem>
              </Select>

              <Input
                label="Slug URL"
                value={slug}
                onValueChange={setSlug}
                description={`http://.../blog/${slug}`}
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
              {featuredImage ? (
                <div className="relative rounded-lg overflow-hidden aspect-video">
                  <Image
                    src={featuredImage}
                    alt="Featured"
                    className="object-cover w-full h-full"
                  />
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    className="absolute top-2 right-2 z-10"
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
                value={featuredImage}
                onValueChange={setFeaturedImage}
                startContent={
                  <span className="text-default-400 text-sm">URL:</span>
                }
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { ArrowRight, Link as LinkIcon, QrCode } from "lucide-react";

import { title, subtitle } from "@/components/primitives";
import { postService } from "@/services/postService";
import { BlogCard } from "@/components/BlogCard";
import { Post } from "@/types/blog";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oat - Full Stack Developer (Go, Next.js) | Portfolio & Web Tools",
  description:
    "รวมผลงาน Web Application ระบบย่อลิงก์ และ QR Code Generator พัฒนาโดยโอ๊ต ผู้เชี่ยวชาญด้าน Go และ Next.js",
};

export default async function Home() {
  // Fetch latest posts (handling potential errors gracefully)
  let latestPosts: Post[] = [];

  try {
    const posts = await postService.getPublishedPosts();

    // Sort by Date (newest first) just in case the API doesn't
    latestPosts = posts
      .sort((a, b) => {
        const dateA = new Date(
          (a.published_at as any)?.Time || a.published_at || a.created_at,
        ).getTime();
        const dateB = new Date(
          (b.published_at as any)?.Time || b.published_at || b.created_at,
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 3);
  } catch (error) {
    // Fail silently for now, or you could log to an external service
  }

  return (
    <div className="flex flex-col items-center justify-center gap-16 py-8 md:py-10">
      {/* --- Hero Section --- */}
      <section className="flex flex-col items-center justify-center text-center max-w-4xl px-6">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title({ size: "lg" })}>Hello, I&apos;m&nbsp;</h1>
          <h1 className={title({ color: "violet", size: "lg" })}>Oat&nbsp;</h1>
          <br />
          <h1 className={title({ size: "lg" })}>Full Stack Developer.</h1>
          <h2 className={subtitle({ class: "mt-4" })}>
            Specialized in Go, Next.js, and building high-performance web
            applications.
          </h2>
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            as={Link}
            className="font-semibold"
            color="primary"
            href="#tools"
            radius="full"
            size="lg"
            variant="solid"
          >
            My Tools
          </Button>
          <Button
            as={Link}
            className="font-semibold"
            href="/blog"
            radius="full"
            size="lg"
            variant="bordered"
          >
            Read Articles
          </Button>
        </div>
      </section>

      {/* --- Tools Section --- */}
      <section
        className="w-full max-w-6xl px-6 flex flex-col items-center"
        id="tools"
      >
        <div className="mb-10 text-center">
          <h2 className={title({ size: "md" })}>Web Tools</h2>
          <p className="text-default-500 mt-2">
            Powerful tools developed to solve real-world problems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Tool 1: Shotlinks */}
          <Card isPressable className="py-4" shadow="sm">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <LinkIcon size={24} />
                </div>
                <h4 className="font-bold text-large">Shotlinks</h4>
              </div>
              <p className="text-tiny uppercase font-bold text-default-500">
                URL Shortener
              </p>
              <small className="text-default-500 mt-1">
                High-performance URL shortener built with Golang & SQLC. Handles
                high traffic with ease.
              </small>
            </CardHeader>
            <CardBody className="overflow-visible py-2">
              <div className="w-full h-[200px] bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                {/* Placeholder for Screenshot */}
                <LinkIcon className="text-white/80 w-20 h-20" />
              </div>
            </CardBody>
            <CardFooter className="justify-end">
              <Button
                as={Link}
                color="primary"
                endContent={<ArrowRight size={16} />}
                href="/shotlinks"
                radius="full"
                size="sm"
                variant="flat"
              >
                Try Shotlinks
              </Button>
            </CardFooter>
          </Card>

          {/* Tool 2: QR Generator */}
          <Card isPressable className="py-4" shadow="sm">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-success/10 rounded-lg text-success">
                  <QrCode size={24} />
                </div>
                <h4 className="font-bold text-large">QR Generate</h4>
              </div>
              <p className="text-tiny uppercase font-bold text-default-500">
                QR Code Creator
              </p>
              <small className="text-default-500 mt-1">
                Customizable QR Code generator for your business needs. Simple,
                fast, and free.
              </small>
            </CardHeader>
            <CardBody className="overflow-visible py-2">
              <div className="w-full h-[200px] bg-gradient-to-tr from-green-500 to-emerald-400 rounded-xl flex items-center justify-center">
                {/* Placeholder for Screenshot */}
                <QrCode className="text-white/80 w-20 h-20" />
              </div>
            </CardBody>
            <CardFooter className="justify-end">
              <Button
                as={Link}
                color="success"
                endContent={<ArrowRight size={16} />}
                href="/qrgenerate"
                radius="full"
                size="sm"
                variant="flat"
              >
                Create QR Code
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* --- Tech Stack Section --- */}
      <section className="w-full max-w-4xl px-6 flex flex-col items-center text-center">
        <h2 className={title({ size: "sm" })} style={{ fontSize: "1.5rem" }}>
          Powered by Modern Tech Stack
        </h2>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {[
            "Go (Golang)",
            "Next.js 14",
            "TypeScript",
            "PostgreSQL",
            "Docker",
            "HeroUI",
            "Tailwind CSS",
            "Redis",
          ].map((tech) => (
            <Chip
              key={tech}
              className="border-default-200"
              size="lg"
              variant="bordered"
            >
              {tech}
            </Chip>
          ))}
        </div>
      </section>

      {/* --- Latest Articles Section --- */}
      {latestPosts.length > 0 && (
        <section className="w-full max-w-6xl px-6 flex flex-col items-center">
          <div className="flex justify-between items-end w-full mb-8 border-b-1 border-default-100 pb-4">
            <div>
              <h2 className={title({ size: "md" })}>Latest Articles</h2>
              <p className="text-default-500 mt-1">
                Sharing knowledge and experiences.
              </p>
            </div>
            <Button
              as={Link}
              className="hidden md:flex"
              endContent={<ArrowRight size={16} />}
              href="/blog"
              variant="light"
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {latestPosts.map((post) => (
              <div key={post.id} className="h-[400px]">
                <BlogCard post={post} />
              </div>
            ))}
          </div>

          <Button
            as={Link}
            className="mt-8 md:hidden"
            endContent={<ArrowRight size={16} />}
            href="/blog"
            variant="ghost"
          >
            View All Articles
          </Button>
        </section>
      )}
    </div>
  );
}

import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { postService } from "@/services/postService";
import BlogListClient from "./BlogListClient";

export default async function BlogPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["public-posts"],
    queryFn: postService.getPublishedPosts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
        </header>
        <BlogListClient />
      </div>
    </HydrationBoundary>
  );
}
